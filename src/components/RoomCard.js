import React, {Component} from 'react';
import '../css/Lobby.css';

class RoomCard extends Component {


	render() {
		return (
			<div className="room">
				<span className="room-name">The Music Room</span>
				<div className="img-container">
					<img className="pic"
						 src="http://d817ypd61vbww.cloudfront.net/sites/default/files/styles/media_responsive_widest/public/tile/image/AbbeyRoad.jpg"
					/>
				</div>
				<div className="room-info">
					<span>13 users listening to</span><br/>
					<span>Lucy in the Sky With Diamonds - The Beatles</span>
				</div>

			</div>
		)
	}
}

export default RoomCard