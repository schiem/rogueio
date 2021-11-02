import { Attributes, Component, ComponentChild, ComponentChildren, Ref } from "preact";
import { resolveProjectReferencePath } from "typescript";
import { EventEmitter } from "../../../../common/src/events/EventEmitter";
import { MessageData } from "../../../../common/src/events/server/MessageEvent";
import { localize } from "../../lang/Lang";

type MessageState = {
    messages: string[]
}

type MessageProps = {
    messageEmitter: EventEmitter<MessageData>
}

export class UIMessages extends Component<MessageProps, MessageState> {
    maxMessages = 50;
    messageSubscription: number;

    constructor(props: MessageProps) {
        super(props);
        this.state = {
            messages: []
        };

    }

    componentDidMount(): void {
        this.messageSubscription = this.props.messageEmitter.subscribe((data) => {
            localize(data.message, data.replacements).then((msg) => {
                this.addMessage(msg);
            })
        });
    }

    addMessage(message: string): void {
        this.state.messages.push(message);
        if (this.state.messages.length > this.maxMessages) {
            this.state.messages.splice(0, 1);
        }
        this.forceUpdate();
    }

    render(): ComponentChild {
        return <div id="messages">
            <div class="terminal">
                <div class="terminal-title">Messages</div>
                <div class="terminal-content">
                    <ul class="scrollable-list scroll-bottom">
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