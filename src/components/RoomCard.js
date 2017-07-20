import React, {Component} from "react"
import "../css/Lobby.css"

class RoomCard extends Component {


	render() {
		if (this.props.private === true) {
			return RoomCard.Private(this.props)
		} else {
			return RoomCard.Public(this.props)
		}
	}

	static Private(props) {
		//temp
		let np = {...props}
		np.room_name = props.room_name + ' [private]'
		return RoomCard.Public(np)
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
						 src={(props.current_track && props.current_track.albumURL) || '../../default.png'}
					/>
				</div>
				{infoText}

			</div>
		)
	}
}


export default RoomCard