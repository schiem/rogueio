import { localize } from "../../lang/Lang";
import { StatComponent } from "../../../../common/src/components/StatComponent";
import { Attributes, Component, ComponentChild, ComponentChildren, Ref, render } from "preact";
import { EventEmitter } from "../../../../common/src/events/EventEmitter";

type StatState = {
    stats: StatComponent;
    statNameList: Record<string, string>;
};

type StatProps = {
    stats: StatComponent;
    componentChangedEmitter: EventEmitter<{id: number, props: Record<string, any>, oldProps: Record<string, any>}>;
};

export class UIStatBlock extends Component<StatProps, StatState> {
    componentChangedEmitter: EventEmitter<{id: number, props: Record<string, any>, oldProps: Record<string, any>}>;
    subscription: number;
    constructor({ stats, componentChangedEmitter }: StatProps) {
        super();
        this.state = {
            stats: stats,
            statNameList:  {
                'str': '',
                'dex': '',
                'con': ''
            }
        };

        const promises: Promise<any>[] = [];
        for(const statName in this.state['statNameList']) {
            promises.push(localize(`common/stats/${statName}`).then(localized => {
                this.state.statNameList[statName] = localized;
            }));
        }
        Promise.all(promises).then(() => {
            this.forceUpdate();
        });
        this.componentChangedEmitter = componentChangedEmitter;
    }

    componentDidMount(): void {
        this.subscription = this.componentChangedEmitter.subscribe((data) => {
            // Force the update because the state has mutated
            // Fuck immutable states, all my homies hate immutable states
            this.forceUpdate();
        });
    }

    componentWillUnmount(): void {
        this.componentChangedEmitter.unsubscribe(this.subscription);
    }

    render() {
        return <div id="stats">
          <div class="terminal">
            <div class="terminal-title">Stats</div>
            <div class="terminal-content">
              <ul>
                  {Object.keys(this.state.statNameList).map(key => 
                    <li class="statblock"><span>{this.state.statNameList[key]}</span><span>{(this.state.stats.current as any)[key] + ' / ' + (this.state.stats.max as any)[key]}</span></li>
                  )}
              </ul>
            </div>
          </div>
        </div>
    }
}