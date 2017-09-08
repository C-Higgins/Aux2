/**
 * Created by chhiggin on 7/11/17.
 */
import React, {Component} from "react"
import Chat from "./Chat.js"
import ProgressBarMusic from "./ProgressBar.js"
import ReactTable from "react-table"
import Player from "react-sound"
import Upload from "react-dropzone"
import Spinner from "react-spinkit"
import firebase from "../index.js"
import ProgressBarUpload from "react-progressbar.js"
import "react-table/react-table.css"
import "../css/Room.css"
import '../css/ProgressBar.css'

const db = firebase.database()
const user = firebase.auth().currentUser
const storage = firebase.storage()

const queueColumns = [{
	Header:    null,
	resizable: false,
	width:     24,
	accessor:  'pending',
	Cell:      props => props.value ? <Spinner name="pulse" fadeIn='none' className="track-spinner"/> : null,
	className: 'pending'
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
	Cell:      props => formatTime(props.value)
}]

class Room extends Component {

	// vvvvvvvvvvv Lifecycles vvvvvvvvvvv
	constructor(props) {
		super(props)

		this.state = {
			uploading:     null, //Object of uploading track data ref by fb key
			isPlaying:     false,
			infoIsOpen:    window.localStorage.getItem('showInfo'),
			historyIsOpen: window.localStorage.getItem('showHistory'),
			volume:        window.localStorage.getItem('volume') ? parseInt(window.localStorage.getItem('volume'), 10) : 75,
			votedToSkip:   false,
			votes:         0,
		}
		this.roomId = props.match.params.roomId
		this.handleUploads = this.handleUploads.bind(this)
		this.trackEnded = this.trackEnded.bind(this)
		this.onPlaying = this.onPlaying.bind(this)
		this.toggleHistory = this.toggleHistory.bind(this)
		this.toggleInfo = this.toggleInfo.bind(this)
		this.toggleVote = this.toggleVote.bind(this)
		this.onVolumeChange = this.onVolumeChange.bind(this)


		const userRef = db.ref('room_data/' + this.roomId + '/users/' + user.uid)
		const connectedRef = firebase.database().ref(".info/connected");
		connectedRef.on("value", data => {
			if (data.val() === true) {
				userRef.set({
					displayName: user.displayName,
					vote:        false,
				})
				userRef.onDisconnect().remove()
			}
		})
	}

	componentDidMount() {
		// Initial public room info
		db.ref('rooms/' + this.roomId).once('value').then(data => {
			if (data.val() === null) {
				this.setState({nullPage: true})
			}
			this.setState({...data.val()})
		})

		// Track queue changes
		let time = Date.now()
		db.ref('room_data/' + this.roomId + '/songs').on('value', async data => {
			if (data.exists()) {
				const newTime = Date.now()

				const songDatas = Object.keys({...data.val().pending, ...data.val().uploaded}).map(sId => {
					return db.ref('song_data/' + this.roomId + '/' + sId).once('value').then(ss => ss.val())
				})

				// Only update with the latest r_d value regardless of how fast the s_d come back
				const songs = await Promise.all(songDatas)
				if (newTime >= time) {
					this.setState({songs: songs})
					time = newTime
				}
			} else {
				this.setState({songs: {}})
			}

		})

		// Track current track changes
		db.ref('room_data/' + this.roomId + '/current_track').on('value', ss => {
			if (ss.exists()) {
				this.setState({
					playFrom:  Math.max(Date.now() - ss.val().startedAt, 0),
					isPlaying: true,
				})
			} else if (this.state.current_track) {
				this.trackEnded()
			}
			this.setState({current_track: {...ss.val()}, votedToSkip: false})
		})

		//track votes
		db.ref(`room_data/${this.roomId}/votes`).on('value', ss => {
			this.setState({votes: ss.val() || 0})
		})
	}

	componentWillUnmount() {
		clearInterval(this.progressUpdateInterval)
		//necessary? yes
		//put all the connections in an array or something
		//db.ref('room_data/' + this.roomId + '/users').off()
		db.ref('room_data/' + this.roomId + '/users/' + user.uid).remove()
		db.ref('room_data/' + this.roomId + '/songs').off()
		db.ref('room_data/' + this.roomId + '/current_track').off()
		db.ref(`room_data/${this.roomId}/votes`).off()
	}

	// ^^^^^^^^^^^ Lifecycles ^^^^^^^^^^^

	// vvvvvvvvvvv User interactions vvvvvvvvvvv
	handleUploads(accepted, rejected) {
		if (!accepted.length) {
			return false
		}
		accepted.forEach(async file => {
			const metadata = await getMetadata(file, {duration: true})
			//need another solution for getting duration

			// Create song key and data
			const sDataRef = db.ref('song_data/' + this.roomId).push()
			const key = sDataRef.getKey()

			// set up song db object
			const {picture, ...songObj} = {
				...metadata,
				name:    file.name,
				artist:  metadata.artist[0],
				key:     key,
				pending: true,
			}

			sDataRef.set(songObj)
			sDataRef.onDisconnect().remove()

			// Tell the database you're about to be uploading something
			const sUploadedRef = db.ref('room_data/' + this.roomId + '/songs/uploaded/' + key)
			const sPendingRef = db.ref('room_data/' + this.roomId + '/songs/pending/' + key)
			sPendingRef.onDisconnect().remove()
			sPendingRef.set(true)

			// Upload art if there is any
			if (metadata.picture && metadata.picture[0]) {
				var dataURL = 'data:image/' + metadata.picture[0].format + ';base64,' +
					btoa(uint8ToString(metadata.picture[0].data))
				storage.ref(`art/${file.name}.${metadata.picture[0].format}`).put(metadata.picture[0].data)
				.then(ss =>
					// Put the art URL into the song data
					db.ref(`song_data/${this.roomId}/${key}/albumURL`).set(ss.downloadURL)
				)
			}

			// Add to local uploads
			this.setState(ps => {
				return {
					uploading: {
						...ps.uploading,
						[key]: {
							totalBytes: file.size,
							albumURL:   dataURL || '../../default.png',
							...songObj,
						}
					}
				}
			})

			// Start file upload
			const uploadSongTask = storage.ref('songs/' + file.name).put(file)

			// Track the upload status
			uploadSongTask.on('state_changed', ss => {
				this.setState(ps => {
					return {
						uploading: {
							...ps.uploading,
							[key]: {...ps.uploading[key], bytesTransferred: ss.bytesTransferred}
						}
					}
				})
			})

			// Once upload is completed...
			uploadSongTask.then(ss => {
				// Remove it from the uploading state (local)
				let newState = {}
				this.setState(ps => {
					Object.keys(ps.uploading).forEach(_key => {
						if (_key !== key) {
							newState[_key] = ps.uploading[_key]
						}
					})
					return {uploading: newState}
				})

				// Give the database the URL
				db.ref('song_urls/' + key).set(ss.downloadURL)

				// Tell the db it is no longer pending
				sPendingRef.remove()
				sUploadedRef.set(true)
				sDataRef.update({pending: false})

				//Turn off disconnection listener
				sPendingRef.onDisconnect().cancel()
				sDataRef.onDisconnect().cancel()
			})
		})
	}

	toggleInfo() {
		window.localStorage.setItem('showInfo', this.state.infoIsOpen ? '' : 1)
		this.setState(ps => ({infoIsOpen: !ps.infoIsOpen}))
	}

	toggleHistory() {
		if (!this.state.historyIsOpen) {
			// show history somehow
		}
		window.localStorage.setItem('showHistory', this.state.historyIsOpen ? '' : 1)
		this.setState(ps => ({historyIsOpen: !ps.historyIsOpen}))
	}

	toggleVote() {
		db.ref(`room_data/${this.roomId}/users/${user.uid}/vote`).set(!this.state.votedToSkip)
		this.setState(ps => ({votedToSkip: !ps.votedToSkip}))
	}

	onVolumeChange(e) {
		window.localStorage.setItem('volume', e.target.value)
		this.setState({volume: parseInt(e.target.value, 10)})
	}

	// ^^^^^^^^^^^ User interactions ^^^^^^^^^^^

	// vvvvvvvvvvv Music events vvvvvvvvvvv
	isDoneLoading() {
		return this.state.current_track !== undefined &&
			this.state.songs !== undefined &&
			this.state.room_name !== undefined
	}

	trackEnded() {
		this.setState({isPlaying: false})
		clearInterval(this.progressUpdateInterval)
		this.progressUpdateInterval = null
	}

	onPlaying(smo) {
		//SM gets duration so we can use that and skip the MM parse for it
		if (this.state.current_track && !this.state.current_track.duration) {
			this.setState({current_track: Object.assign(this.state.current_track, {duration: smo.duration * 1000})})
		}
	}

	// ^^^^^^^^^^^ Music events ^^^^^^^^^^^

	render() {
		if (this.isDoneLoading()) {
			let uploadMessage = 'Upload'
			if (this.state.uploading && Object.keys(this.state.uploading).length) {
				uploadMessage = Object.keys(this.state.uploading).map(key => {
					const track = this.state.uploading[key]
					return (
						<div className="img-with-overlay" key={key}>
							<img
								src={track.albumURL}
								alt=""
							/>
							<div className="img-overlay">
								<ProgressBarUpload.Circle
									progress={track.bytesTransferred / track.totalBytes}
									options={{
										color:       '#560e0e',
										strokeWidth: 20,
										trailColor:  'transparent',
									}}
								/>
							</div>
						</div>
					)
				})
			}
			return (
				<div id="room-container">
					<Player
						url={this.state.current_track.url || ''}
						//playFromPosition={Date.now() - this.props.startedAt}
						playFromPosition={this.state.playFrom}
						playStatus={this.state.isPlaying ? 'PLAYING' : 'STOPPED'}
						onFinishedPlaying={this.trackEnded}
						onPlaying={this.onPlaying}
						volume={this.state.volume}
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
								<MusicInfo {...this.state.current_track}
										   historyIsOpen={this.state.historyIsOpen}
										   infoIsOpen={this.state.infoIsOpen}
										   votedToSkip={this.state.votedToSkip}
								/>
								{this.state.current_track.duration &&
								<ProgressBarMusic
									startedAt={this.state.current_track.startedAt}
									duration={this.state.current_track.duration}
								/>
								}
								<Controls onChange={this.onVolumeChange}
										  toggleInfo={this.toggleInfo}
										  toggleHistory={this.toggleHistory}
										  toggleVote={this.toggleVote}
										  volume={window.localStorage.getItem('volume')}

										  historyIsOpen={this.state.historyIsOpen}
										  infoIsOpen={this.state.infoIsOpen}
										  votedToSkip={this.state.votedToSkip}
								/>
							</div>
						</div>
						<ReactTable
							className="-striped queue"
							data={[...this.state.songs]}
							columns={queueColumns}
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
							noDataText="Upload a song to get started!"
							getTrProps={(state, rowInfo) => {
								if (!rowInfo || !rowInfo.row.pending) return true;
								return {
									className: 'pending'
								}
							}}
						/>
						<Upload
							onDrop={this.handleUploads}
							accept="audio/*"
							style={{}}
							id="upload"
							//docs: https://react-dropzone.js.org/
						>

							<div className="img-uploading">
								{uploadMessage}
							</div>
						</Upload>
					</div>
					<Chat
						roomId={this.roomId}
						user={user}/>
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

export default Room

function Controls(props) {
	const volumeSymbol = props.volume < 20 ? 'volume_mute' : props.volume > 80 ? 'volume_up' : 'volume_down'
	return (
		<div id="controls">
			<i className={"material-icons control" + (props.infoIsOpen ? ' selected' : '')}
			   onClick={props.toggleInfo}>
				info
			</i>
			<i className={"material-icons control" + (props.historyIsOpen ? ' selected' : '')}
			   onClick={props.toggleHistory}>
				history
			</i>
			<i className={"material-icons control" + (props.votedToSkip ? ' selected' : '')}
			   onClick={props.toggleVote}>
				skip_next
			</i>
			<div className="right">
				<i className="material-icons">
					{volumeSymbol}
				</i>
				<input type="range" min="0" max="100" defaultValue={props.volume} step="5"
					   onChange={props.onChange}/>
			</div>
		</div>
	)
}

function MusicInfo(props) {
	if (props.title) {
		if (!props.infoIsOpen) {
			// less info
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
			}
		} else {
			//more info
			let line1 = `${props.title} - ${props.artist} `
			line1 += props.albumartist ? `(${props.albumartist})` : null
			let line2 = `${props.album}, ${props.year}`
			let line3 = `${formatTime(props.duration)} `
			line3 += props.track.of ? `Track ${props.track.no}/${props.track.of}, ` : null
			line3 += props.disk.of ? `Disk ${props.disk.no}/${props.disk.of}. ` : null
			line3 += props.genre ? `(${props.genre.join('/')})` : null

			if (props.title) {
				return (
					<div id="music-info">
						{line1}<br/>
						{line2}<br/>
						<small>{line3}</small>
					</div>
				)
			}
		}
	} else {
		return <div id="music-info">Nothing at the moment</div>
	}

}

// vvvvvvvvvvv Utils vvvvvvvvvvv
async function getMetadata(file, settings = {}) {
	const mm = await import('musicmetadata')
	return new Promise((res, rej) => {
		mm(file, settings, ((err, metadata) => {
			err && rej(err)
			res(metadata)
		}))
	})
}

function uint8ToString(u8a) {
	const CHUNK_SZ = 0x8000;
	let c = [];
	for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
		c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
	}
	return c.join("");
}

function formatTime(time) {
	let minutes = Math.floor(time / 60)
	let seconds = parseInt(time - (minutes * 60), 10)
	seconds = seconds < 10 ? '0' + seconds : seconds
	return `${minutes}:${seconds}`
}

// ^^^^^^^^^^^ Utils ^^^^^^^^^^^