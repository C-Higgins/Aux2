import React, {Component} from 'react';
import '../css/Room.css';
import firebase from 'firebase'
class Room extends Component {

	constructor(props) {
		super(props)
		this.roomID = props.match.params.roomID
		this.fb = firebase.database().ref();
	}

	componentWillMount() {
		this.fb.child('rooms/' + this.roomID).once('value', data => {
			this.setState({...data.val()})
		})
		this.fb.child('room_data/' + this.roomID).on('value', data => {
			this.setState({...data.val()})
		})
		this.fb.child('room_users/' + this.roomID).on('child_added', user => {
			this.fb.child('users/' + user.getKey()).once('value', userD => {
				this.setState(ps => {
					return {users: Object.assign({}, ps.users, {[userD.getKey()]: userD.val()})}
				})
			})
		})
	}

	componentWillUnmount() {
		this.fb.off('room_data/' + this.roomID)
		this.fb.off('room_users/' + this.roomID)
		this.fb.off()
	}

	render() {
		return <div>room test {this.props.match.params.roomID}</div>
	}
}

export default Room