import React, {Component} from "react"
import "../css/Lobby.css"
import RoomCard from "./RoomCard.js"
import {Link} from "react-router-dom"
import firebase from "../index.js"
import Spinner from "react-spinkit"

class Lobby extends Component {

	constructor(props) {
		super(props)
		this.state = {}
		this.fb = firebase.database().ref()
		this.user = firebase.auth().currentUser
	}

	componentDidMount() {
		this.fb.child('rooms').on('value', data => {
			this.setState({rooms: {...data.val()}})
		})
		this.fb.child('room_data').on('value', data => {
			this.setState({room_data: {...data.val()}})
		})
	}

	componentWillUnmount() {
		this.fb.child('rooms').off()
		this.fb.child('room_data').off()
		this.fb.off()
	}

	render() {
		if (!this.state.rooms || !this.state.room_data) {
			return <div id="rooms-container"><Spinner name="line-scale" color="#560e0e" fadeIn="half"/></div>
		}

		const mergedLobbyData = Object.keys(this.state.rooms).map(key => {
			return Object.assign({},
				this.state.rooms[key],
				this.state.room_data[key],
				{users: this.state.room_data[key].users ? Object.keys(this.state.room_data[key].users).length : 0},
				{key: key}
			)
		})

		let roomCards
		if (mergedLobbyData) {
			roomCards = mergedLobbyData.map(r => {
				return <Link to={r.key} key={r.key}><RoomCard {...r}/></Link>
			})
		} else {
			roomCards = []
		}


		return (
			<div id="rooms-container">
				{roomCards}
			</div>
		)
	}
}

export default Lobby