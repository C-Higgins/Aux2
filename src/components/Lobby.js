import React, {Component} from 'react';
import '../css/Lobby.css';
import RoomCard from './RoomCard.js'

class Lobby extends Component {


	render() {
		return (
			<div id="wrapper">
				<div id="header">
					<span id="aux">Aux</span>
					<div id="buttons">
						<div id="create-button" className="lobby-button">--></div>
						<div id="button2" className="lobby-button">--></div>
					</div>

				</div>
				<div id="room-container">
					<RoomCard />
					<RoomCard />
					<RoomCard />
					<RoomCard />
					<RoomCard />
					<RoomCard />
					<RoomCard />
					<RoomCard />
					<RoomCard />
					<RoomCard />
				</div>
			</div>
		)
	}
}

export default Lobby