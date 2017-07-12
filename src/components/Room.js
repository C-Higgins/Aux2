/**
 * Created by chhiggin on 7/11/17.
 */
import React, {Component} from "react"
import Chat from "./Chat.js"
import ReactTable from "react-table"
import Player from "react-sound"
import Upload from "react-dropzone"
import Spinner from "react-spinkit"
import firebase from "firebase"
import "react-table/react-table.css"
import "../css/Room.css"

class Room extends Component {

	constructor(props) {
		super(props)

		this.state = {
			uploading:     null,
			progress:      0,
			loading:       true,
			loaded:        0,
			messages:      [],
			current_track: {},
		}
		this.roomId = props.match.params.roomId
		this.fb = firebase.database().ref();
		this.storage = firebase.storage().ref()
		this.handleUploads = this.handleUploads.bind(this)
		this.sendChat = this.sendChat.bind(this)
	}

	static queueColumns = [{
		Header:   'Title',
		accessor: 'title' // String-based value accessors!
	}, {
		Header:   'Artist',
		accessor: 'artist'
	}, {
		Header:   'Album',
		accessor: 'album' // Custom value accessors!
	}, {
		Header:    'Time', // Custom header components!
		accessor:  'time',
		resizable: false,
		width:     80,
	}]

	handleUploads(accepted, rejected) {
		if (accepted.length) {
			accepted.forEach(file => {
				this.setState({uploading: file.name})
				let uploadTask = this.storage.child('songs/' + file.name).put(file)
				uploadTask.then(ss => {
					this.setState({uploading: null})
				})
				uploadTask.on('state_changed', ss => {
					this.setState({progress: (100 * ss.bytesTransferred / ss.totalBytes).toFixed(0)})
				})
			})
		}
	}

	componentDidMount() {
		// Initial public room info
		this.fb.child('rooms/' + this.roomId).once('value', data => {
			if (data.val() === null) {
				this.setState({nullPage: true})
			}
			this.setState(ps => {
				return {...data.val(), loaded: ps.loaded + 1}
			})
			this.checkDoneLoading()
		})

		// Track queue changes
		this.fb.child('room_data/' + this.roomId + '/songs').on('child_added', ss => {
			let sId = ss.getKey()
			this.fb.child('song_data/' + this.roomId + '/' + sId).once('value', songD => {
				this.setState(ps => {
					return {songs: Object.assign({}, ps.songs, {[sId]: songD.val()}), loaded: ps.loaded + 1}
				})
			})
		})

		// Track current track changes
		this.fb.child('room_data/' + this.roomId + '/current_track').on('value', ss => {
			this.setState(ps => {
				return {current_track: {...ss.val()}, loaded: ps.loaded + 1}
			})

			this.checkDoneLoading()
		})

		// Listen for new messages
		this.fb.child('messages/' + this.roomId).limitToLast(100).on('value', data => {
			const messages = Object.keys(data.val()).map(key => {
				return data.val()[key]
			})
			this.setState({messages: messages})
			this.checkDoneLoading()
		})
	}

	checkDoneLoading() {
		this.setState(ps => {
			return {loading: ps.loaded < 3} //the number of FB calls
		})
	}

	componentWillUnmount() {
		this.fb.child('rooms/' + this.roomId).off()
		this.fb.child('room_data/' + this.roomId).off()
		this.fb.child('song_data/' + this.roomId).off()
		this.fb.child('room_users/' + this.roomId).off()
		this.fb.child('messages/' + this.roomId).off()
		this.fb.off()
	}

	sendChat(message) {
		let newMsgRef = firebase.database().ref('messages/' + this.roomId).push()
		newMsgRef.set({
			author:  'sendchattest',
			message: message,
		})

	}


	render() {

		if (!this.state.loading) {
			let uploadMessage = this.state.uploading ? `Uploading ${this.state.uploading} - ${this.state.progress}%` : 'Upload'
			let queueData = Object.keys(this.state.songs).map(k => {
					return this.state.songs[k]
				}) || []

			return (
				<div id="room-container">
					{/*"https://firebasestorage.googleapis.com/v0/b/aux-io.appspot.com/o/02%20She%20Was%20Too%20Good%20To%20Me.mp3?alt=media&token=725d8d47-347e-433c-b81d-049a79511379"
					 http://d817ypd61vbww.cloudfront.net/sites/default/files/styles/media_responsive_widest/public/tile/image/AbbeyRoad.jpg*/}
					<Player
						url={''}
						//playFromPosition={Date.now() - this.props.startedAt}
						playFromPosition={100000}
						playStatus="PLAYING"
					/>
					<div id="music">
						<div id="now-playing">
							<div id="img-container">
								<img className="pic"
									 alt="np_album"
									 src={this.state.current_track.albumURL}
								/>
							</div>
							<div id="right">
								<div id="music-info">
									{this.state.current_track.title}<br/>
									<small>{this.state.current_track.artist}<br/>{this.state.current_track.album}, {this.state.current_track.year}
									</small>
								</div>
								<div id="controls">
									controls
								</div>
							</div>
						</div>
						<ReactTable
							className="-striped queue"
							data={queueData}
							columns={Room.queueColumns}
							resizable={true}
							showPaginationBottom={false}
						/>
						<Upload
							onDrop={this.handleUploads}
							accept="audio/*"
							style={{}}
							id="upload"
							//docs: https://react-dropzone.js.org/
						>
							{uploadMessage}

						</Upload>
					</div>
					<Chat messages={this.state.messages} sendChat={this.sendChat}/>
				</div>
			)
		} else {
			return <div id="room-container">
				<Spinner name="wave" color="#560e0e" fadeIn="half"/>
			</div>
		}
	}
}


export default Room