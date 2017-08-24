/**
 * Created by chhiggin on 7/11/17.
 */
import React, {Component} from "react"
import Chat from "./Chat.js"
import ReactTable from "react-table"
import Player from "react-sound"
import Upload from "react-dropzone"
import Spinner from "react-spinkit"
import firebase from "../index.js"
import mm from "musicmetadata"
import "react-table/react-table.css"
import "../css/Room.css"

class Room extends Component {

	constructor(props) {
		super(props)

		this.state = {
			uploading: null,
			progress:  0,
			loading:   true,
			loaded:    0,
			messages:  [],
		}
		this.roomId = props.match.params.roomId
		this.db = firebase.database().ref()
		this.user = firebase.auth().currentUser
		this.storage = firebase.storage().ref()
		this.handleUploads = this.handleUploads.bind(this)
		this.sendChat = this.sendChat.bind(this)
		this.trackEnded = this.trackEnded.bind(this)
	}

	static queueColumns = [{
		Header:   'Title',
		accessor: 'title'
	}, {
		Header:   'Artist',
		accessor: 'artist'
	}, {
		Header:   'Album',
		accessor: 'album'
	}, {
		Header:    'Time',
		accessor:  'duration',
		resizable: false,
		width:     60,
	}]

	//TODO: When uploading multiple files it visually fucks up
	handleUploads(accepted, rejected) {
		if (accepted.length) {
			accepted.forEach(file => {

				mm(file, {duration: true}, (err, metadata) => {
					if (err) throw err;
					const songObj = {
						album:    metadata.album,
						artist:   metadata.artist[0],
						title:    metadata.title,
						year:     metadata.year,
						duration: metadata.duration,
					}
					this.setState({uploading: file.name})
					let uploadSongTask = this.storage.child('songs/' + file.name).put(file)

					if (metadata.picture && metadata.picture[0]) {
						//noinspection ES6ConvertVarToLetConst
						var uploadAlbumTask = this.storage.child('art/' + file.name + '.' + metadata.picture[0].format).put(metadata.picture[0].data)
					}
					uploadSongTask.on('state_changed', ss => {
						this.setState({progress: (100 * ss.bytesTransferred / ss.totalBytes).toFixed(0)})
					})

					uploadSongTask.then(ss => {
						this.setState({uploading: null})
						let sRef = this.db.child('song_data/' + this.roomId).push()
						let key = sRef.getKey()
						sRef.set(songObj)
						this.db.child('song_urls/' + key).set(ss.downloadURL)
						this.db.child('room_data/' + this.roomId + '/songs/' + key).set(true)

						if (metadata.picture && metadata.picture[0]) {
							uploadAlbumTask.then(ss => {
								this.db.child('song_data/' + this.roomId + '/' + key + '/albumURL').set(ss.downloadURL)
							})
						}
					})
				})
			})
		}
	}

	componentWillMount() {
		let userRef = this.db.child('room_data/' + this.roomId + '/users/' + this.user.uid)
		userRef.set({
			displayName: this.user.displayName
		})
		userRef.onDisconnect().remove()
	}

	componentDidMount() {
		// Initial public room info
		this.db.child('rooms/' + this.roomId).once('value').then(data => {
			if (data.val() === null) {
				this.setState({nullPage: true})
			}
			this.setState({...data.val()})
		})

		// Track queue changes
		this.db.child('room_data/' + this.roomId + '/songs').on('value', data => {
			if (data.val()) {
				let songsVar = {}
				Object.keys(data.val()).forEach(sId => {
					this.db.child('song_data/' + this.roomId + '/' + sId).once('value', songD => {
						this.setState({songs: Object.assign(songsVar, {[sId]: songD.val()})})
					})
				})

			} else {
				this.setState({songs: {}})
			}

		})

		// Track current track changes
		this.db.child('room_data/' + this.roomId + '/current_track').on('value', ss => {
			if (ss.exists()) {
				this.setState({playFrom: Math.max(Date.now() - ss.val().startedAt, 0)})
			}
			this.setState({current_track: {...ss.val()}})
		})

		// Track users in room
		this.db.child('room_data/' + this.roomId + '/users').on('value', ss => {
			this.setState({users: ss.val()})
		})

		// Listen for new messages
		this.db.child('messages/' + this.roomId).limitToLast(100).on('value', data => {
			if (data.val()) {
				const messages = Object.keys(data.val()).map(key => {
					return data.val()[key]
				})
				this.setState({messages: messages})
			}
		})
	}

	isDoneLoading() {
		return this.state.current_track !== undefined &&
			this.state.songs !== undefined &&
			this.state.room_name !== undefined &&
			this.state.users !== undefined
	}

	componentWillUnmount() {
		this.db.off()
		this.db.child('room_data/' + this.roomId + '/users').off()
		this.db.child('room_data/' + this.roomId + '/users/' + this.user.uid).remove()
	}

	trackEnded() {
		//this.setState({current_track: {}})
		let oReq = new XMLHttpRequest();
		let url = "https://us-central1-aux-io.cloudfunctions.net/trackEnded"
		url += `?roomId=${this.roomId}`
		oReq.open("GET", url);
		oReq.send();
	}

	sendChat(message) {
		let newMsgRef = firebase.database().ref('messages/' + this.roomId).push()
		newMsgRef.set({
			author:  this.user.displayName,
			message: message,
		})
	}


	render() {

		if (this.isDoneLoading()) {
			let uploadMessage = this.state.uploading ? `Uploading ${this.state.uploading} - ${this.state.progress}%` : 'Upload'
			if (!!this.state.songs) {
				//noinspection ES6ConvertVarToLetConst
				var queueData = Object.keys(this.state.songs).map(k => {
					return this.state.songs[k]
				})
			} else {
				queueData = []
			}

			return (
				<div id="room-container">
					<Player
						url={this.state.current_track.url || ''}
						//playFromPosition={Date.now() - this.props.startedAt}
						playFromPosition={this.state.playFrom}
						playStatus={this.state.current_track ? 'PLAYING' : 'STOPPED'}
						onFinishedPlaying={this.trackEnded}
					/>
					<div id="music">
						<div id="now-playing">
							<div id="img-container">
								<img className="pic"
									 alt="np_album"
									 src={this.state.current_track.albumURL || '../../default.png'}
								/>
							</div>
							<div id="right">
								<MusicInfo {...this.state.current_track}/>
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
					<Chat
						messages={this.state.messages}
						users={this.state.users}
						sendChat={this.sendChat}/>
				</div>
			)
		} else {
			return <div id="room-container">
				<Spinner name="line-scale" color="#560e0e" fadeIn="half"/>
			</div>
		}
	}
}

function MusicInfo(props) {
	if (props.title) {
		return (
			<div id="music-info">
				{props.title}<br/>
				<small>{props.artist}<br/>{props.album}, {props.year}
				</small>
			</div>
		)
	} else {
		return <div id="music-info">Nothing at the moment</div>
	}

}

export default Room