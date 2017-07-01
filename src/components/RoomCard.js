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

        let infoText
        if (props.current_track) {
            infoText = <div className="room-info">
				<span>{props.users} users listening to</span><br/>
				<span>{props.current_track.title}</span>
			</div>
        } else {
            infoText = <div className="room-info">
				<span>{props.users} users just chilling</span><br/>
			</div>
        }

		return (
			<div className="room">
				<span className="room-name">{props.room_name}</span>
				<div className="img-container">
					<img className="pic"
						 alt="np_album"
						 src="http://d817ypd61vbww.cloudfront.net/sites/default/files/styles/media_responsive_widest/public/tile/image/AbbeyRoad.jpg"
					/>
				</div>
                {infoText}

			</div>
		)
	}
}


export default RoomCard