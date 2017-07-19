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
//import mm from "music-metadata"
import mm from "musicmetadata"
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
		accessor:  'duration',
		resizable: false,
		width:     80,
	}]

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
						var uploadAlbumTask = this.storage.child('art/' + file.name + '.' + metadata.picture[0].format).put(metadata.picture[0].data)
					}
					uploadSongTask.on('state_changed', ss => {
						this.setState({progress: (100 * ss.bytesTransferred / ss.totalBytes).toFixed(0)})
					})

					uploadSongTask.then(ss => {
						this.setState({uploading: null})
						let sRef = this.fb.child('song_data/' + this.roomId).push()
						let key = sRef.getKey()
						sRef.set(songObj)
						this.fb.child('song_urls/' + key).set(ss.downloadURL)
						this.fb.child('room_data/' + this.roomId + '/songs/' + key).set(true)

						if (metadata.picture) {
							uploadAlbumTask.then(ss => {
								this.fb.child('song_data/' + this.roomId + '/' + key + '/albumURL').set(ss.downloadURL)
							})
						}
					})
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
			this.setState({...data.val()})
			this.checkDoneLoading()
		})

		// Track queue changes
		this.fb.child('room_data/' + this.roomId + '/songs').on('child_added', ss => {
			let sId = ss.getKey()
			this.fb.child('song_data/' + this.roomId + '/' + sId).once('value', songD => {
				this.setState(ps => {
					return {songs: Object.assign({}, ps.songs, {[sId]: songD.val()})}
				})
			})
		})

		// Track current track changes
		this.fb.child('room_data/' + this.roomId + '/current_track').on('value', ss => {
			this.setState({current_track: {...ss.val()}})

			this.checkDoneLoading()
		})

		// Listen for new messages
		this.fb.child('messages/' + this.roomId).limitToLast(100).on('value', data => {
			if (data.val()) {
				const messages = Object.keys(data.val()).map(key => {
					return data.val()[key]
				})
				this.setState({messages: messages})
			}
			this.checkDoneLoading()
		})
	}

	checkDoneLoading() {
		this.setState(ps => {
			return {loading: this.state.messages === {}}
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
			if (!!this.state.songs) {
				var queueData = Object.keys(this.state.songs).map(k => {
					return this.state.songs[k]
				})
			} else {
				queueData = []
			}

			return (
				<div id="room-container">
					{/*"https://firebasestorage.googleapis.com/v0/b/aux-io.appspot.com/o/02%20She%20Was%20Too%20Good%20To%20Me.mp3?alt=media&token=725d8d47-347e-433c-b81d-049a79511379"
					 http://d817ypd61vbww.cloudfront.net/sites/default/files/styles/media_responsive_widest/public/tile/image/AbbeyRoad.jpg*/}
					<Player
						url={this.state.current_track.url || ''}
						//playFromPosition={Date.now() - this.props.startedAt}
						playFromPosition={0}
						playStatus="PLAYING"
					/>
					<div id="music">
						<div id="now-playing">
							<div id="img-container">
								<img className="pic"
									 alt="np_album"
									 src={this.state.current_track.albumURL || ''}
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