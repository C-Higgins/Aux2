import React, {Component} from "react"
import "../css/App.css"
import {db} from "../index.js"
import Lobby from "./Lobby.js"
import Room from "./Room.js"
import Modal from "./Modal.js"
import {BrowserRouter as Router, Link, Route} from "react-router-dom"

class App extends Component {

	constructor(props) {
		super(props)
		this.state = {
			...props,
			modalOpen: false,
		}

		this.createRoom = this.createRoom.bind(this)
	}

	createRoom(name, priv) {
		console.log(name, priv)
		let key = db.child('rooms').push().key
		let newRoom = {
			room_name: name,
			private:   priv,
		}
		let newRoomData = {
			track_playing: false,
			current_track: null,
			songs:         {},
			users:         {
				u1: true,
			}
		}

		db.child('/rooms/' + key).set(newRoom)
		db.child('/room_data/' + key).set(newRoomData)

		db.child('/users/u1/rooms').update({
			[key]: true,
		})

		this.setState({modalOpen: false})
		window.location = '/' + key;
	}

	componentWillMount() {
		db.on('value', data => {
			this.setState({...data.val()})
		})
	}

	render() {
		const mergedLobbyData = Object.keys(this.state.rooms).map(key => {
			return Object.assign({},
				this.state.rooms[key],
				this.state.room_data[key],
				{users: Object.keys(this.state.room_data[key].users).length || 0},
				{key: key}
			)
		})

		return (
			<Router>
				<div id="wrapper">
					<Header openModal={() => this.setState({modalOpen: true})}/>
					<Modal submit={this.createRoom} open={this.state.modalOpen}
						   close={() => this.setState({modalOpen: false})}/>
					<Route exact path="/" render={() => <Lobby rooms={mergedLobbyData}/>}/>
					<Route path="/:roomID" component={Room}/>
				</div>
			</Router>
		);
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
