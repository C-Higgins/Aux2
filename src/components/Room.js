/**
 * Created by chhiggin on 7/11/17.
 */
import React, {Component} from "react"
import Chat from "./Chat.js"
import ProgressBar from './ProgressBar.js'
import ReactTable from "react-table"
import Player from "react-sound"
import Upload from "react-dropzone"
import Spinner from "react-spinkit"
import firebase from "../index.js"
import mm from "musicmetadata"
//import mm from "music-metadata"
import "react-table/react-table.css"
import "../css/Room.css"

class Room extends Component {

	constructor(props) {
		super(props)

		this.state = {
			uploading:      null,
			uploadProgress: 0,
			loading:        true,
			loaded:         0,
			position:       0,
			isPlaying:      false,
		}
		this.roomId = props.match.params.roomId
		this.db = firebase.database().ref()
		this.user = firebase.auth().currentUser
		this.storage = firebase.storage().ref()
		this.handleUploads = this.handleUploads.bind(this)
		this.trackEnded = this.trackEnded.bind(this)
		this.onPlaying = this.onPlaying.bind(this)
	}

	static queueColumns = [{
		Header:     '',
		resizeable: false,
		width:      50,
		accessor:   'pending',
		Cell:       props => <div>{props.value &&<Spinner name="circle" noFadeIn={true} className="track-spinner"/>}</div>
	}, {
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
	//TODO: Rewrite to show uploads in queue (like how podcasts download)
	//TODO: Remove from db when upload cancels
	handleUploads(accepted, rejected) {
		if (accepted.length) {
			accepted.forEach(file => {

				mm(file, {duration: true}, (err, metadata) => { //need another solution for getting duration
					if (err) throw err;
					const songObj = {
						album:    metadata.album,
						artist:   metadata.artist[0],
						title:    metadata.title,
						year:     metadata.year,
						duration: metadata.duration * 1000,
						pending:  true,
					}
					this.setState({uploading: file.name})

					let sDataRef = this.db.child('song_data/' + this.roomId).push()
					let key = sDataRef.getKey()
					sDataRef.set(songObj)

					let sUploadedRef = this.db.child('room_data/' + this.roomId + '/songs/uploaded/' + key)
					let sPendingRef = this.db.child('room_data/' + this.roomId + '/songs/pending/' + key)
					sPendingRef.set(true) // Tell the database you're uploading something

					let uploadSongTask = this.storage.child('songs/' + file.name).put(file)
					let uploadAlbumTask = null
					if (metadata.picture && metadata.picture[0]) {
						//noinspection ES6ConvertVarToLetConst
						uploadAlbumTask = this.storage.child('art/' + file.name + '.' + metadata.picture[0].format).put(metadata.picture[0].data)
					}

					uploadSongTask.on('state_changed', ss => {
						this.setState({uploadProgress: (100 * ss.bytesTransferred / ss.totalBytes).toFixed(0)})
					})

					uploadSongTask.then(ss => {
						this.setState({uploading: null})
						this.db.child('song_urls/' + key).set(ss.downloadURL)
						.then(() => {
							sUploadedRef.set(true)
						})
						sDataRef.update({pending: false})
						sPendingRef.remove()


						if (uploadAlbumTask) {
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
			if (data.val() && (data.val().pending || data.val().uploaded)) {
				let songsVar = {}
				data.val().uploaded && Object.keys(data.val().uploaded).forEach(sId => {
					this.db.child('song_data/' + this.roomId + '/' + sId).once('value', songD => {
						this.setState({songs: Object.assign(songsVar, {[sId]: songD.val()})})
					})
				})
				data.val().pending && Object.keys(data.val().pending).forEach(sId => {
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
				this.setState({
					playFrom:  Math.max(Date.now() - ss.val().startedAt, 0),
					isPlaying: true,
				})
			} else {
				this.trackEnded()
			}
			this.setState({current_track: {...ss.val()}})
		})
	}

	isDoneLoading() {
		return this.state.current_track !== undefined &&
			this.state.songs !== undefined &&
			this.state.room_name !== undefined
	}

	componentWillUnmount() {
		clearInterval(this.progressUpdateInterval)
		this.db.off()
		this.db.child('room_data/' + this.roomId + '/users').off()
		this.db.child('room_data/' + this.roomId + '/users/' + this.user.uid).remove()
	}

	trackEnded() {
		this.setState({isPlaying: false})
		clearInterval(this.progressUpdateInterval)
		this.progressUpdateInterval = null
		let oReq = new XMLHttpRequest();
		let url = "https://us-central1-aux-io.cloudfunctions.net/trackEnded"
		url += `?roomId=${this.roomId}`
		oReq.open("GET", url);
		oReq.send();
	}


	onPlaying(smo) {
		//SM gets duration so we can use that and skip the MM parse for it
		if (this.state.current_track && !this.state.current_track.duration) {
			this.setState({current_track: Object.assign(this.state.current_track, {duration: smo.duration})})
		}
	}


	render() {

		if (this.isDoneLoading()) {
			let uploadMessage = this.state.uploading ? `Uploading ${this.state.uploading} - ${this.state.uploadProgress}%` : 'Upload'
			if (!!this.state.songs) {
				//noinspection ES6ConvertVarToLetConst
				var queueData = Object.keys(this.state.songs).map(k => {
					return this.state.songs[k]
				})
			} else {
				queueData = []
			}

			queueData = [
				{
					title:   'test1',
					time:    300,
					pending: true,
				},
				{
					title:   'test2',
					time:    300,
					pending: false,
				},
				{
					title:   'test3',
					time:    300,
					pending: false,
				},
				{
					title:   'test4',
					time:    300,
					pending: true,
				},
				{
					title:   'test5',
					time:    300,
					pending: true,
				}
			]

			return (
				<div id="room-container">
					<Player
						url={this.state.current_track.url || ''}
						//playFromPosition={Date.now() - this.props.startedAt}
						playFromPosition={this.state.playFrom}
						playStatus={this.state.current_track ? 'PLAYING' : 'STOPPED'}
						onFinishedPlaying={this.trackEnded}
						onPlaying={this.onPlaying}
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
								{this.state.isPlaying && <ProgressBar
									startedAt={this.state.current_track.startedAt}
									duration={this.state.current_track.duration}
								/>}
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
							defaultSorted={[
								{
									id: 'pending',
								},
								{
									id: 'title'
								}
							]}
							//defaultPageSize="30"
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
						roomId={this.roomId}
						user={this.user}/>
				</div>
			)
		} else if (!this.state.nullPage) {
			return <div id="room-container">
				<Spinner name="line-scale" color="#560e0e" fadeIn="half" className="room-spinner"/>
			</div>
		} else {
			return <div id="room-container">
				invalid page
			</div>
		}
	}
}

function MusicInfo(props) {
	let line1 = props.title
	let line2 = props.artist
	let line3 = <small>{props.album}, {props.year}</small>
	if (props.title) {
		return (
			<div id="music-info">
				{line1}<br/>
				{line2}<br/>
				{line2 && line3}
			</div>
		)
	} else {
		return <div id="music-info">Nothing at the moment</div>
	}
}

export default Room