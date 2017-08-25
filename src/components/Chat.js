import React, {Component} from "react"
class Chat extends Component {
	constructor(props) {
		super(props)
		this.state = {
			textareaValue: '',
			showUsers:     false,
		}

		this.handleChange = this.handleChange.bind(this)
		this.checkKey = this.checkKey.bind(this)
		this.showUsers = this.showUsers.bind(this)
	}

	handleChange(event) {
		this.setState({textareaValue: event.target.value})
	}

	componentDidUpdate(prevProps) {
		if (this.props.messages.length > prevProps.messages.length) {
			this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight
		}
	}

	componentDidMount() {
		this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight
	}


	checkKey(event) {
		if (event.keyCode !== 13) return;
		event.preventDefault();
		if (event.target.value === '') return;
		this.setState({textareaValue: ''});
		this.props.sendChat(event.target.value);
	}

	showUsers() {
		this.setState((ps) => ({showUsers: !ps.showUsers}))
		this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight
	}

	render() {
		const systemStyle = {fontStyle: 'italic'}
		const messages = this.props.messages.map((message, i) => {
			return (
				<p className='message' key={i} style={message.system ? systemStyle : null}>
					{message.author && <strong>{message.author}:</strong>}<br/>{message.message}
				</p>
			)
		})

		const userList = this.props.users.map(user => {
			return <div>{user}</div>
		})
		return (
			<div id='chat'>
				<div id="users-small" className={this.state.showUsers ? 'slide' : ''} onClick={this.showUsers}>

					<i className="material-icons">
						{this.state.showUsers ? 'arrow_drop_up' : 'arrow_drop_down'}
					</i>
					<span style={{position: 'absolute', left: '10px'}}>
						<i className="material-icons">group</i>
						{this.props.users.length}
					</span>
					<br/>
					<div id="users-big">{userList}</div>
				</div>

				<div id="chat-messages-container">
					<div id="chat-messages" ref={(div => {
						this.messagesDiv = div
					})}>{messages}</div>
				</div>
				<textarea value={this.state.textareaValue} onChange={this.handleChange} onKeyDown={this.checkKey}
						  className="chat-input" type="text"
						  placeholder="Chat..."/>

			</div>
		)
	}
}

export default Chat