import React, {Component} from 'react';
import '../css/Room.css';
import ErrorPage from './ErrorPage.js'
import RoomPage from './RoomPage.js'
import firebase from 'firebase'
import Spinner from 'react-spinkit'
class Room extends Component {


	//this has async issues after mount but before fb comes in
	constructor(props) {
		super(props)
		this.roomID = props.match.params.roomID
		this.fb = firebase.database().ref();
		this.state = {
			loading: true,
			loaded:  0
		}
	}

	componentWillMount() {
		this.fb.child('rooms/' + this.roomID).once('value', data => {
			if (data.val() === null) {
				this.setState({nullPage: true})
			}
			this.setState(ps => {
				return {...data.val(), loaded: ps.loaded+1}
			})
			this.checkDoneLoading()
		})

		this.fb.child('room_data/' + this.roomID).on('value', data => {
			this.setState(ps => {
				return {...data.val(), loaded: ps.loaded+1}
			})
            this.checkDoneLoading()
		})

		this.fb.child('room_users/' + this.roomID).on('child_added', user => {
			this.fb.child('users/' + user.getKey()).once('value', userD => {
				this.setState(ps => {
					return {users: Object.assign({}, ps.users, {[userD.getKey()]: userD.val()})}
				})
			})
		})

	}

	checkDoneLoading() {
		this.setState(ps => {
			return {loading: ps.loaded < 2} //the number of FB calls
		})
	}


	componentWillUnmount() {
		this.fb.child('rooms/' + this.roomID).off()
		this.fb.child('room_data/' + this.roomID).off()
		this.fb.child('room_users/' + this.roomID).off()
		this.fb.off()
	}

	render() {
		if (this.state.loading) {
			return <Spinner name="wave" color="#560e0e" fadeIn="half"/>
		} else if (this.state.nullPage) {
			return <ErrorPage e={404}/> //not the r-router way...
		} else {
			return <RoomPage />
		}
	}
}

export default Room