import React, {Component} from "react"
import "../css/Lobby.css"
import RoomCard from "./RoomCard.js"
import LoginModal from "./LoginModal"
import {Link} from "react-router-dom"
import firebase from "../index.js"
import Spinner from "react-spinkit"

class Lobby extends Component {

	constructor(props) {
		super(props)
		this.state = {
			loginModalOpen: false
		}
		this.fb = firebase.database().ref()
		this.user = firebase.auth().currentUser
	}

	componentDidMount() {
		this.fb.child('rooms').on('value', data => {
			this.setState({rooms: data.val()})
		})
	}

	componentWillUnmount() {
		this.fb.child('rooms').off()
		this.fb.child('room_data').off()
		this.fb.off()
	}

	isLoaded() {
		return this.state.rooms
	}

	openModal(e) {
		console.log(e)
		this.setState({loginModalOpen: true})
	}

	render() {
		if (!this.isLoaded()) {
			return <div id="rooms-container"><Spinner name="line-scale" color="#560e0e" fadeIn="half"
													  className="room-spinner"/></div>
		}

		const roomCards = Object.keys(this.state.rooms).map(key => {
			if (this.state.rooms[key].private) {
				return <a key={key} onClick={() => this.openModal(key)}> <RoomCard {...this.state.rooms[key]}/> </a>
			}
			return (
				<Link to={key} key={key}>
					<RoomCard {...this.state.rooms[key]}

					/>
				</Link>
			)
		})

		return (
			<div id="rooms-container">
				{this.state.loginModalOpen &&
				<LoginModal submit={this.joinRoom}
							close={() => this.setState({loginModalOpen: false})}

				/>
				}
				{roomCards}
			</div>
		)
	}
}

export default Lobby