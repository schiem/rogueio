import { Component, ComponentChild } from "preact";
import { Bus } from "../../../../common/src/bus/Buses";
import { localize } from "../../lang/Lang";

type MessageState = {
    messages: string[]
}

export class UIMessages extends Component<{}, MessageState> {
    maxMessages = 50;
    messageSubscription: number;

    constructor() {
        super();
        this.state = {
            messages: []
        };
    }

    componentDidMount(): void {
        this.addMessage(localize('system/gameStart'));
        this.messageSubscription = Bus.messageEmitter.subscribe((data) => {
            this.addMessage(localize(data.message, data.replacements));
        });
    }

    addMessage(message: string): void {
        const messages = [...this.state.messages, message];
        if (messages.length > this.maxMessages) {
            messages.splice(0, 1);
        }
        this.setState({messages});
    }

    render(): ComponentChild {
        return <div id="messages" class="ui-block">
            <div class="terminal">
                <div class="terminal-title">Messages</div>
                <div class="terminal-content">
                    <ul class="scrollable-list scroll-bottom">
                        { !this.state.messages.length && 
                            <li class="separated-row">{ localize('messages/noMessages')}</li>
                        }
                        { this.state.messages.map(message => 
                            <li class="separated-row">{ message }</li>
                        )}
                        <li class="pin-to-bottom"></li>
                    </ul>
                </div>
            </div>
        </div>
    }
}