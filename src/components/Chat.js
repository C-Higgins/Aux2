import React, {PureComponent} from "react"
import firebase from "../index.js"
import '../css/Chat.css'

class Chat extends PureComponent {
	constructor(props) {
		super(props)
		this.state = {
			showUsers: false,
			messages:  [],
			users:     [],
		}

		this.messagesDB = firebase.database().ref('messages/' + this.props.roomId)
		this.checkKey = this.checkKey.bind(this)
		this.showUsers = this.showUsers.bind(this)
	}

	sendChat(message) {
		let newMsgRef = this.messagesDB.push()
		newMsgRef.set({
			author:    this.props.user.displayName,
			message:   message,
			timestamp: firebase.database.ServerValue.TIMESTAMP,
		})
	}

	componentDidMount() {
		this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight

		// Listen for new messages
		this.messagesDB.limitToLast(100).on('value', data => {
			if (data.val()) {
				const messages = Object.values(data.val())
				this.setState({messages: messages}, () => {
					this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight
				})

			}
		})

		// Track users in room
		firebase.database().ref('room_data/' + this.props.roomId + '/users').on('value', ss => {
			let users = []
			if (ss.val() !== null) {
				users = Object.values(ss.val()).map(user => {
					return user.displayName
				})
			}
			this.setState({users: users})
		})
	}

	componentWillUnmount() {
		this.messagesDB.off()
		firebase.database().ref('room_data/' + this.props.roomId + '/users').off()
	}


	checkKey(event) {
		if (event.keyCode !== 13 || event.target.value === '') return;
		event.preventDefault();
		this.sendChat(event.target.value);
		this.textArea.value = '';
	}

	showUsers() {
		this.setState((ps) => ({showUsers: !ps.showUsers}))
		this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight
	}

	render() {
		const systemStyle = {fontStyle: 'italic'}
		const messages = this.state.messages.map((message) => {
			return (
				<p className='message' key={message.timestamp} style={message.system ? systemStyle : null}>
					{message.author && <strong>{message.author}:</strong>}<br/>{message.message}
				</p>
			)
		})

		const userList = this.state.users.map((user, i) => {
			return <div key={i}>{user}</div>
		})
		return (
			<div id='chat'>
				<div id="users-small" className={this.state.showUsers ? 'slide' : ''} onClick={this.showUsers}>

					<i className="material-icons">
						{this.state.showUsers ? 'arrow_drop_up' : 'arrow_drop_down'}
					</i>
					<span style={{position: 'absolute', left: '10px'}}>
						<i className="material-icons">group</i>
						{this.state.users.length}
					</span>
					<br/>
					<div id="users-big">{userList}</div>
				</div>

				<div id="chat-messages-container">
					<div id="chat-messages" ref={(div => {
						this.messagesDiv = div
					})}>{messages}</div>
				</div>
				<textarea
					onKeyDown={this.checkKey}
					className="chat-input" type="text"
					placeholder="Chat..."
					ref={textarea => {
						this.textArea = textarea
					}}
				/>

			</div>
		)
	}
}

export default Chat