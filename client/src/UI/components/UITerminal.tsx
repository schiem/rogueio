import { Component, ComponentChild, createRef } from "preact";
import { localize } from "../../lang/Lang";

export type TerminalProps = {
    title: string;
    id: string;
    classes: string[]
}

export type TerminalState = {
    winbox?: WinBox
}

type TerminalLocation = {
    x?: number,
    y?: number,
    w?: number,
    h?: number,
    open: boolean
}

export class Terminal extends Component<TerminalProps, TerminalState> {
    ref = createRef();

    labels = {
        float: localize('ui/float'), 
        anchor: localize('ui/anchor'), 
    }

    componentDidMount(): void {
        const location = this.loadState();

        if (!location) {
            // Write the initial state
            this.saveLocation({
                open: false
            });
        }
        else if (location.open) {
            this.floatWindow();
        }
    }

    floatWindow(): void {
        const loadedLocation = this.loadState();
        let location: TerminalLocation;
        if (!loadedLocation) {  
            location = {
                open: true
            };
        }
        else {
            location = loadedLocation;
            location.open = true;
        }

        // Resave the state to record that it's open
        this.saveLocation(location);

        const wb = new window.WinBox(this.props.title, {
            mount: this.ref.current,
            width: location.w,
            height: location.h,
            x: location.x,
            y: location.y,
            class: ["no-full", "no-max", "no-min"],

            onclose: () => {
                this.setState({
                    winbox: undefined
                });
                location.open = false;
                this.saveLocation(location);
                return false;
            },
            onmove: (x, y) => {
                location.x = x;
                location.y = y;
                this.saveLocation(location);
            },
            onresize: (w, h) => {
                location.w = w;
                location.h = h;
                this.saveLocation(location);
            }
        });

        this.setState({
            winbox: wb
        });
    }

    saveLocation(location: TerminalLocation): void {
        if (location) {
            localStorage.setItem(this.getStorageKey(), JSON.stringify(location));
        }
        else {
            localStorage.removeItem(this.getStorageKey());
        }
    }

    loadState(): TerminalLocation | undefined {
        const location = localStorage.getItem(this.getStorageKey());
        if (location) {
            try {
                return JSON.parse(location);
            }
            catch {
                return;
            }
        }
        return;
    }

    getStorageKey(): string {
        return `terminal-${this.props.id}`;
    }

    render(): ComponentChild {
        return <div ref={this.ref} id={this.props.id} class={this.props.classes.join(' ')}>
            <div class="terminal">
                { !this.state.winbox && 
                    <div class="terminal-title columned">
                        <div>{this.props.title}</div>
                        <div><button type="button" class="light icon-only" title={this.labels.float} onClick={() => this.floatWindow()}><i class="icon arrow-top-right"></i></button></div>
                    </div> 
                }
                <div class="terminal-content">
                    { this.props.children }
                </div>
            </div>
        </div>
    }
}