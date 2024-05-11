/**
 * This class is largely based on the Chromium source.
 * https://chromium.googlesource.com/chromium/src/+/master/ui/gfx/geometry/cubic_bezier.cc
 */
const clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);
const kBezierEpsilon = 1e-7;
const CUBIC_BEZIER_SPLINE_SAMPLES = 11;
const kMaxNewtonIterations = 4;
export class CubicBezier {
    private ax: number;
    private bx: number;
    private cx: number;

    private ay: number;
    private by: number;
    private cy: number;

    private startGradient: number;
    private endGradient: number;
    private rangeMin: number;
    private rangeMax: number;

    private splineSamples: number[] = new Array(CUBIC_BEZIER_SPLINE_SAMPLES);

    constructor(
        p1x: number,
        p1y: number,
        p2x: number,
        p2y: number
    ) {
        this.initCoefficients(p1x, p1y, p2x, p2y);
        this.initGradients(p1x, p1y, p2x, p2y);
        this.initRange(p1y, p2y);
        this.initSpline();
    }

    solve(x: number): number {
        return this.solveWithEpsilon(x, kBezierEpsilon);
    }

    private toFinite(value: number): number {
        if (!isFinite(value)) {
            if (value > 0) {
                return Number.MAX_VALUE;
            }
            return Number.MIN_VALUE;
        }

        return value;
    }

    private initCoefficients(p1x: number, p1y: number, p2x: number, p2y: number): void {
        this.cx = 3.0 * p1x;
        this.bx = 3.0 * (p2x - p1x) - this.cx;
        this.ax = 1.0 - this.cx - this.bx;
        this.cy = this.toFinite(3.0 * p1y);
        this.by = this.toFinite(3.0 * (p2y - p1y) - this.cy);
        this.ay = this.toFinite(1.0 - this.cy - this.by);
    }

    private initGradients(p1x: number, p1y: number, p2x: number, p2y: number): void {
        if (p1x > 0) {
            this.startGradient = p1y / p1x;
        } else if (!p1y && p2x > 0) {
            this.startGradient = p2y / p2x;
        } else if (!p1y && !p2y) {
            this.startGradient = 1;
        } else {
            this.startGradient = 0;
        }

        if (p2x < 1) {
            this.endGradient = (p2y - 1) / (p2x - 1);
        } else if (p2y == 1 && p1x < 1) {
            this.endGradient = (p1y - 1) / (p1x - 1);
        } else if (p2y == 1 && p1y == 1) {
            this.endGradient = 1;
        } else {
            this.endGradient = 0;
        }
    }

    private initRange(p1y: number, p2y: number): void {
        this.rangeMin = 0;
        this.rangeMax = 1;
        if (0 <= p1y && p1y < 1 && 0 <= p2y && p2y <= 1) {
            return;
        }
        const epsilon = kBezierEpsilon;
        const a = 3.0 * this.ay;
        const b = 2.0 * this.by;
        const c = this.cy;
        if (Math.abs(a) < epsilon && Math.abs(b) < epsilon) {
            return;
        }

        let t1 = 0;
        let t2 = 0;
        if (Math.abs(a) < epsilon) {
            t1 = -c / b;
        } else {
            const discriminant = b * b - 4 * a * c;
            if (discriminant < 0) {
                return;
            }
            const discriminant_sqrt = Math.sqrt(discriminant);
            t1 = (-b + discriminant_sqrt) / (2 * a);
            t2 = (-b - discriminant_sqrt) / (2 * a);
        }
        let sol1 = 0;
        let sol2 = 0;
        if (0 < t1 && t1 < 1)
            sol1 = this.sampleCurveY(t1);
        if (0 < t2 && t2 < 1)
            sol2 = this.sampleCurveY(t2);
        this.rangeMin = Math.min(this.rangeMin, sol1, sol2);
        this.rangeMax = Math.max(this.rangeMax, sol1, sol2);
    }

    private initSpline(): void {
        const delta_t = 1.0 / (CUBIC_BEZIER_SPLINE_SAMPLES - 1);
        for (let i = 0; i < CUBIC_BEZIER_SPLINE_SAMPLES; i++) {
            this.splineSamples[i] = this.sampleCurveX(i * delta_t);
        }
    }

    private sampleCurveX(t: number): number {
        return ((this.ax * t + this.bx) * t + this.cx) * t;
    }

    private sampleCurveY(t: number): number {
        return this.toFinite(((this.ay * t + this.by) * t + this.cy) * t);
    }

    private sampleCurveDerivativeX(t: number): number {
        return (3.0 * this.ax * t + 2.0 * this.bx) * t + this.cx;
    }

    private sampleCurveDerivativeY(t: number): number {
        return this.toFinite(
            this.toFinite(this.toFinite(3.0 * this.ay) * t + this.toFinite(2.0 * this.by)) * t + this.cy);
    }

    private solveWithEpsilon(x: number, epsilon: number): number {
        if (x < 0.0) {
            return this.toFinite(0.0 + this.startGradient * x);
        }
        if (x > 1.0) {
            return this.toFinite(1.0 + this.endGradient * (x - 1.0));
        }
        return this.sampleCurveY(this.solveCurveX(x, epsilon));
    }

    private solveCurveX(x: number, epsilon: number): number {
        if (x < 0 || x > 1) {
            throw new Error('X must be between 0 and 1');
        }
        let t0;
        let t1;
        let t2 = x;
        let x2;
        let d2;
        let i;
        // Linear interpolation of spline curve for initial guess.
        const delta_t = 1.0 / (CUBIC_BEZIER_SPLINE_SAMPLES - 1);
        for (i = 1; i < CUBIC_BEZIER_SPLINE_SAMPLES; i++) {
            if (x <= this.splineSamples[i]) {
                t1 = delta_t * i;
                t0 = t1 - delta_t;
                t2 = t0 + (t1 - t0) * (x - this.splineSamples[i - 1]) /
                    (this.splineSamples[i] - this.splineSamples[i - 1]);
                break;
            }
        }
        // Perform a few iterations of Newton's method -- normally very fast.
        // See https://en.wikipedia.org/wiki/Newton%27s_method.
        const newtonEpsilon = Math.min(kBezierEpsilon, epsilon);
        for (i = 0; i < kMaxNewtonIterations; i++) {
            x2 = this.sampleCurveX(t2) - x;
            if (Math.abs(x2) < newtonEpsilon)
                return t2;
            d2 = this.sampleCurveDerivativeX(t2);
            if (Math.abs(d2) < kBezierEpsilon)
                break;
            t2 = t2 - x2 / d2;
        }
        if (Math.abs(x2 as number) < epsilon)
            return t2;
        // Fall back to the bisection method for reliability.
        while ((t0 as number) < (t1 as number)) {
            x2 = this.sampleCurveX(t2);
            if (Math.abs(x2 - x) < epsilon)
                return t2;
            if (x > x2)
                t0 = t2;
            else
                t1 = t2;
            t2 = ((t1 as number) + (t0 as number)) * .5;
        }
        // Failure.
        return t2;
    }

    private slopeWithEpsilon(x: number, epsilon: number): number {
        x = clamp(x, 0.0, 1.0);
        const t = this.solveCurveX(x, epsilon);
        const dx = this.sampleCurveDerivativeX(t);
        const dy = this.sampleCurveDerivativeY(t);
        // TODO(crbug.com/1275534): We should clamp NaN to a proper value.
        // Please see the issue for detail.
        if (!dx && !dy)
            return 0;
        return this.toFinite(dy / dx);
    }

    private slope(x: number): number {
        return this.slopeWithEpsilon(x, kBezierEpsilon);
    }
}