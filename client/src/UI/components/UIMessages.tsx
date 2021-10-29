import { Attributes, Component, ComponentChild, ComponentChildren, Ref } from "preact";

type MessageState = {
    messages: string[]
}

export class UIMessages extends Component<{}, MessageState> {
    maxMessages = 50;

    constructor() {
        super();
        this.state = {
            messages: []
        };
    }

    componentDidMount(): void {
        setInterval(() => {
            // The idea of copying the entire array to push into it 
            // is absolutely asinine and the reason people make fun of
            // javascript
            this.addMessage("This is a new message");
        }, 1000);
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