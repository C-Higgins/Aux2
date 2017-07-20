import React, {Component} from "react"
import "../css/App.css"
import firebase from "firebase"
import Lobby from "./Lobby.js"
import Room from "./Room.js"
import Modal from "./Modal.js"
import Spinner from "react-spinkit"
import {BrowserRouter as Router, Link, Route} from "react-router-dom"

class App extends Component {

	constructor(props) {
		super(props)
		this.state = {
			loaded:    0,
			loading:   true,
			modalOpen: false,
			rooms:     {},
			room_data: {
				users: {}
			},
		}
		this.fb = firebase.database().ref();
		this.createRoom = this.createRoom.bind(this)
	}

	createRoom(name, priv) {
		console.log(name, priv)
		let key = this.fb.child('rooms').push().key
		let newRoom = {
			room_name: name,
			private:   priv,
		}
		let newRoomData = {
			track_playing: false,
			current_track: {},
			songs:         {},
			users:         {
				u1: true,
			}
		}

		const p1 = this.fb.child('/rooms/' + key).set(newRoom)
		const p2 = this.fb.child('/room_data/' + key).set(newRoomData)
		const p3 = this.fb.child('/users/u1/rooms').update({
			[key]: true,
		})
		Promise.all([p1, p2, p3]).then(() => {
			window.location = '/' + key;
		})
	}

	componentWillMount() {
		this.fb.child('rooms').on('value', data => {
			this.setState({rooms: {...data.val()}})
			this.setState(ps => ({loaded: ps.loaded + 1}))
			this.checkDoneLoading()
		})
		this.fb.child('room_data').on('value', data => {
			this.setState({room_data: {...data.val()}})
			this.setState(ps => ({loaded: ps.loaded + 1}))
			this.checkDoneLoading()
		})
	}

	componentWillUnmount() {
		this.fb.child('rooms').off()
		this.fb.child('room_data').off()
		this.fb.off()
	}

	checkDoneLoading() {
		this.setState(ps => {
			return {loading: ps.loaded < 2} //the number of FB calls
		})
	}

	render() {
		if (!this.state.loading) {
			if (this.state.rooms && this.state.room_data) {
				var mergedLobbyData = Object.keys(this.state.rooms).map(key => {
					return Object.assign({},
						this.state.rooms[key],
						this.state.room_data[key],
						{users: Object.keys(this.state.room_data[key].users).length || 0},
						{key: key}
					)
				})
			} else {
				mergedLobbyData = []
			}


			return (
				<Router>
					<div id="wrapper">
						<Header openModal={() => this.setState({modalOpen: true})}/>
						<Modal submit={this.createRoom} open={this.state.modalOpen}
							   close={() => this.setState({modalOpen: false})}/>
						<Route exact path="/" render={() => <Lobby rooms={mergedLobbyData}/>}/>
						<Route path="/:roomId" component={Room}/>
					</div>
				</Router>
			)
		} else {
			return <Spinner name="wave" color="#560e0e" fadeIn="half"/>
		}
	}
}

function Header(props) {
	return <div id="header">
		<Link to="/"><span id="aux">Aux</span></Link>
		<div id="buttons">
			<div id="create-button" className="lobby-button" onClick={props.openModal}>---></div>
			<div id="button2" className="lobby-button">--></div>
		</div>
	</div>
}

export default App;
