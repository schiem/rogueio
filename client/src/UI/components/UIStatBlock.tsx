import { localize } from "../../lang/Lang";
import { StatComponent } from "../../../../common/src/components/StatComponent";
import { Component } from "preact";
import { HealthComponent } from "../../../../common/src/components/HealthComponent";
import { StatSystem } from "../../../../common/src/systems/StatSystem";
import { HealthSystem } from "../../../../common/src/systems/HealthSystem";

type StatState = {
    stats: StatComponent;
    health: HealthComponent
};

type StatProps = {
    statSystem: StatSystem,
    healthSystem: HealthSystem,
    playerId: number,
};

export class UIStatBlock extends Component<StatProps, StatState> {
    statSubscription: number;
    healthSubscription: number;
    statLang: Record<string, string> = {
        str: '',
        con: '',
        dex: ''
    };
    healthLang: string;

    constructor() {
        super();

        this.healthLang = localize(`stats/hp`);
        for(const statName in this.statLang) {
            this.statLang[statName] = localize(`stats/${statName}`);
        }
    }

    componentDidMount(): void {
        this.healthSubscription = this.props.healthSystem.componentUpdatedEmitter.subscribe((data) => {
            if (data.id === this.props.playerId) {
                this.updateStats();
            }
        });

        this.statSubscription = this.props.statSystem.componentUpdatedEmitter.subscribe((data) => {
            if (data.id === this.props.playerId) {
                this.updateStats();
            }
        });

        this.updateStats();
    }

    updateStats(): void {
        const healthComponent = this.props.healthSystem.getComponent(this.props.playerId);
        const statsComponent = this.props.statSystem.getComponent(this.props.playerId);

        if (healthComponent) {
            this.setState({
                health: {...healthComponent}
            })
        }

        if (statsComponent) {
            this.setState({
                stats: {...statsComponent}
            })
        }
    }

    componentWillUnmount(): void {
        this.props.healthSystem.componentUpdatedEmitter.unsubscribe(this.healthSubscription);
        this.props.statSystem.componentUpdatedEmitter.unsubscribe(this.statSubscription);
    }

    render() {
        return <div id="stats" class="ui-block">
          <div class="terminal">
            <div class="terminal-title">Stats</div>
            <div class="terminal-content">
              <ul>
                  <li class="columned"><span>{this.healthLang}</span><span>{this.state.health?.current + ' / ' + this.state.health?.max}</span></li>
                  {this.state.stats && Object.keys(this.statLang).map(key => 
                    <li class="columned"><span>{this.statLang[key]}</span><span>{(this.state.stats.current as Record<string, number>)[key] + ' / ' + (this.state.stats.max as Record<string, number>)[key]}</span></li>
                  )}
              </ul>
            </div>
          </div>
        </div>
    }
}