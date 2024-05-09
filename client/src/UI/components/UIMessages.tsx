import { Component, ComponentChild, Fragment, createRef } from "preact";
import { Bus } from "../../../../common/src/bus/Buses";
import { localize } from "../../lang/Lang";
import { ClientDescriptionSystem } from "../../systems/ClientDescriptionSystem";

type MessageState = {
    messages: string[]
}

type MessageProps = {
    descriptionSystem: ClientDescriptionSystem
}

export class UIMessages extends Component<MessageProps, MessageState> {
    maxMessages = 50;
    messageSubscription: number;
    hasScrolled = false;
    scrollRef = createRef();

    constructor() {
        super();
        this.state = {
            messages: []
        };
    }

    componentDidMount(): void {
        this.addMessage(localize('system/gameStart'));
        this.messageSubscription = Bus.messageEmitter.subscribe((data) => {
            const replacements = data.replacements?.map(x => typeof x === 'number' ? this.props.descriptionSystem.getLocalizedName(x) : x);
            this.addMessage(localize(data.message, replacements));
        });
    }

    addMessage(message: string): void {
        const messages = [...this.state.messages, message];
        if (messages.length > this.maxMessages) {
            messages.splice(0, 1);
        }
        this.setState({messages}, () => {
            if (!this.hasScrolled) {
                this.scrollRef.current.scrollTop = this.scrollRef.current.scrollHeight;
            }
        });
    }

    render(): ComponentChild {
        return <Fragment>
            <ul class="scrollable-list scroll-bottom" onScroll={() => this.hasScrolled = true} ref={this.scrollRef}>
                { !this.state.messages.length && 
                    <li class="separated-row">{ localize('messages/noMessages')}</li>
                }
                { this.state.messages.map(message => 
                    <li class="separated-row">{ message }</li>
                )}
                <li class="pin-to-bottom"></li>
            </ul>
        </Fragment>
    }
}