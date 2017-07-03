import React, {Component} from 'react';
import '../css/Lobby.css';
import RoomCard from './RoomCard.js'
import Room from './Room.js'
import {
	BrowserRouter as Router,
	Route,
	Link
} from 'react-router-dom'

class Lobby extends Component {


	render() {
		const roomCards = this.props.rooms.map(r => {
			return <RoomCard {...r}/>
		})

		return (
			<div id="room-container">
				{roomCards}
			</div>
		)
	}
}

export default Lobby