import React, {Component} from "react"
import "../css/Lobby.css"
import RoomCard from "./RoomCard.js"
import {Link} from "react-router-dom"

class Lobby extends Component {


	render() {
		let roomCards
		if (this.props.rooms) {
			roomCards = this.props.rooms.map(r => {
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