import { localize } from "../../lang/Lang";
import { StatComponent } from "../../../../common/src/components/StatComponent";
import { Attributes, Component, ComponentChild, ComponentChildren, Ref, render } from "preact";
import { EventEmitter } from "../../../../common/src/events/EventEmitter";
import { HealthComponent } from "../../../../common/src/components/HealthComponent";

type StatState = {
    stats: StatComponent;
    health: {
        component: HealthComponent;
        lang: string,
    }
    statNameList: Record<string, string>;
};

type StatProps = {
    stats: StatComponent;
    health: HealthComponent,
    componentChangedEmitters: EventEmitter<{id: number, props: Record<string, any>, oldProps: Record<string, any>}>[];
};

export class UIStatBlock extends Component<StatProps, StatState> {
    componentChangedEmitters: EventEmitter<{id: number, props: Record<string, any>, oldProps: Record<string, any>}>[];
    subscriptions?: number[];

    constructor({ stats, health, componentChangedEmitters }: StatProps) {
        super();
        this.state = {
            stats,
            health: {
                lang: '',
                component: health
            },
            statNameList:  {
                'str': '',
                'dex': '',
                'con': ''
            }
        };

        const promises: Promise<any>[] = [
            localize(`common/stats/hp`).then((localized) => {
                this.state.health.lang = localized
            })
        ];
        for(const statName in this.state['statNameList']) {
            promises.push(localize(`common/stats/${statName}`).then(localized => {
                this.state.statNameList[statName] = localized;
            }));
        }
        Promise.all(promises).then(() => {
            this.forceUpdate();
        });
        this.componentChangedEmitters = componentChangedEmitters;
    }

    componentDidMount(): void {
        this.subscriptions = this.componentChangedEmitters.map(subscription => {
            return subscription.subscribe((data) => {
                // Force the update because the state has mutated
                // Fuck immutable states, all my homies hate immutable states
                this.forceUpdate();
            })
        });
    }

    componentWillUnmount(): void {
        const subscriptions = this.subscriptions;
        if (subscriptions) {
            this.componentChangedEmitters.forEach((emitter, index) => {
                emitter.unsubscribe(subscriptions[index]);
            });
            this.subscriptions = undefined;
        }
    }

    render() {
        return <div id="stats">
          <div class="terminal">
            <div class="terminal-title">Stats</div>
            <div class="terminal-content">
              <ul>
                  <li class="columned"><span>{this.state.health.lang}</span><span>{this.state.health.component.current + ' / ' + this.state.health.component.max}</span></li>
                  {Object.keys(this.state.statNameList).map(key => 
                    <li class="columned"><span>{this.state.statNameList[key]}</span><span>{(this.state.stats.current as any)[key] + ' / ' + (this.state.stats.max as any)[key]}</span></li>
                  )}
              </ul>
            </div>
          </div>
        </div>
    }
}