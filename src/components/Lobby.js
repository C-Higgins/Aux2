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
			this.setState({rooms: data.val()})
		})
		this.fb.child('room_data').on('value', data => {
			this.setState({room_data: data.val()})
		})
	}

	componentWillUnmount() {
		this.fb.child('rooms').off()
		this.fb.child('room_data').off()
		this.fb.off()
	}

	isLoaded() {
		return this.state.rooms && this.state.room_data
	}

	render() {
		if (!this.isLoaded()) {
			return <div id="rooms-container"><Spinner name="line-scale" color="#560e0e" fadeIn="half"
													  className="room-spinner"/></div>
		}

		const roomCards = Object.keys(this.state.rooms).map(key => {
			return (
				<Link to={key} key={key}>
					<RoomCard {...this.state.rooms[key]}
							  {...this.state.room_data[key]}
					/>
				</Link>
			)
		})

		return (
			<div id="rooms-container">
				{roomCards}
			</div>
		)
	}
}

export default Lobby