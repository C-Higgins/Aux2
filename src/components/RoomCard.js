import React, {Component} from 'react';
import '../css/Lobby.css';

class RoomCard extends Component {


	render() {
		if (this.props.private === true) {
			return RoomCard.Private(this.props)
		} else {
			return RoomCard.Public(this.props)
		}
	}

	static Private(props) {

	}

	static Public(props) {
		return (
			<div className="room">
				<span className="room-name">{props.room_name}</span>
				<div className="img-container">
					<img className="pic"
						 alt="np_album"
						 src="http://d817ypd61vbww.cloudfront.net/sites/default/files/styles/media_responsive_widest/public/tile/image/AbbeyRoad.jpg"
					/>
				</div>
				<div className="room-info">
					<span>13 users listening to</span><br/>
					<span>{props.current_track}</span>
				</div>

			</div>
		)
	}
}


export default RoomCard