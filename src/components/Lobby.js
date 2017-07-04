import React, {Component} from 'react';
import '../css/Lobby.css';
import RoomCard from './RoomCard.js'
import {
	// BrowserRouter as Router,
	// Route,
	Link
} from 'react-router-dom'

class Lobby extends Component {


	render() {
		const roomCards = this.props.rooms.map(r => {
			return <Link to={r.key} key={r.key}><RoomCard {...r}/></Link>
		})

		return (
			<div id="rooms-container">
				{roomCards}
			</div>
		)
	}
}

export default Lobby