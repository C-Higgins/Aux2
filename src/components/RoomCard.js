import React, {Component} from "react"
import "../css/Lobby.css"
import '../css/ProgressBar.css'
import ProgressBar from './ProgressBar.js'

class RoomCard extends Component {

	render() {
		if (this.props.private === true) {
			return RoomCard.Private(this.props)
		} else {
			return RoomCard.Public(this.props)
		}
	}

	//TODO: Make private rooms look different
	static Private(props) {
		let infoText
		if (props.current_track) {
			infoText = <div className="room-info">
				<span>{props.numUsers} users listening to</span><br/>
				<span>{props.current_track.title}</span>
			</div>
		} else {
			infoText = <div className="room-info">
				<span>{props.numUsers} users in a quiet room</span><br/>
			</div>
		}

		return (
			<div className="room">
				<span className="room-name">{props.room_name + '[private]'}</span>
				<div className="img-container">
					<img className="pic"
						 alt="np_album"
						 src={(props.current_track && props.current_track.albumURL) || '../../default.png'}
					/>
				</div>
				<div className="progress-bar-container-card">
					{props.current_track &&
					<ProgressBar startedAt={props.current_track.startedAt} duration={props.current_track.duration}/>}
				</div>
				{infoText}
			</div>
		)
	}

	static Public(props) {
		let infoText
		if (props.current_track) {
			infoText = <div className="room-info">
				<span>{props.numUsers} users listening to</span><br/>
				<span>{props.current_track.title}</span>
			</div>
		} else {
			infoText = <div className="room-info">
				<span>{props.numUsers} users in a quiet room</span><br/>
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
				<div className="progress-bar-container-card">
					{props.current_track &&
					<ProgressBar startedAt={props.current_track.startedAt} duration={props.current_track.duration}/>}
				</div>
				{infoText}
			</div>
		)
	}
}

export default RoomCard