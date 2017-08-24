const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
//const gcs = require('@google-cloud/storage')//(SAC go here);
const path = require('path');
const fs = require('fs');
admin.initializeApp(functions.config().firebase);
let TRACK_ENDED_TIMESTAMP = Date.now()


exports.roomHandler = functions.database.ref('/room_data/{rId}/songs/{sId}').onCreate(event => {
	const roomId = event.params.rId
	const songId = event.params.sId
	console.log('song created:', songId)
	const currentTrackRef = admin.database().ref('room_data/' + roomId + '/current_track')
	//check if song is currently playing
	return currentTrackRef.once('value').then(ct => {
		//do nothing if it is
		if (ct.exists()) {
			return;
		}
		console.log('no current track')
		const songUrl_pr = admin.database().ref('song_urls/' + songId).once('value')
		const songData_pr = admin.database().ref(`song_data/${roomId}/${songId}`).once('value')


		return Promise.all([songUrl_pr, songData_pr]).then(results => {
			const trackUrl = results[0].val()
			const trackObject = results[1].val()

			const newTrackObject = Object.assign({}, trackObject, {url: trackUrl}, {key: songId}, {startedAt: Date.now() + 200})
			console.log('setting track')
			//otherwise make it play
			return admin.database().ref('room_data/' + roomId).update({
				current_track: newTrackObject,
				track_playing: true,
			}).then(() => {
				return console.log('setting timer')
				//and set the timer for its duration
				//return setTimeout(afterSongEnds(roomId), track.val().duration * 1000)
			})

		})
	})
})

//TODO: Attach a separate server for ticking time instead of relying on client request
//TODO: Also delete from bucket
exports.trackEnded = functions.https.onRequest((req, res) => {
	//if this was called less than 5 seconds ago, ignore it
	if (TRACK_ENDED_TIMESTAMP >= Date.now() - 5000) {
		return res.status(201).send('spam')
	}
	TRACK_ENDED_TIMESTAMP = Date.now()

	//let log = admin.database().ref('/logs')
	let currentTrackRef

	//log.update({msg: 'song ended'})
	cors(req, res, () => {
		let roomId = req.query.roomId
		currentTrackRef = admin.database().ref('room_data/' + roomId + '/current_track')
		return currentTrackRef.once('value').then(ct => {
			let songId
			if (ct.val()) { //just in case c_t is null for some reason, we can keep going
				songId = ct.val().key
			} else {
				songId = 0
			}
			const p1 = admin.database().ref('room_data/' + roomId + '/songs/' + songId).remove()
			const p2 = admin.database().ref('song_urls/' + songId).remove()
			const p3 = admin.database().ref(`song_data/${roomId}/${songId}`).remove()
			return Promise.all([p1, p2, p3]).then(() => {
				//log.update({msg: 'db cleared'})
				// after track ends, start the next one
				return getNextTrack(roomId).then(nextTrack => {
					return setCurrentTrack(nextTrack)
				}).then(() => {
					//log.update({msg: 'all done'})
					return res.status(200).send()
				})
			})
		})
	})

	function getNextTrack(roomKey) {
		//log.update({msg: 'getting next track'})
		return admin.database().ref('song_data/' + roomKey).once('value').then(ss => {
			if (ss.exists()) {
				const keys = Object.keys(ss.val())
				const numberOfSongs = keys.length
				const rand = Math.floor(Math.random() * numberOfSongs)
				return mergeTrackWithUrl(ss.val()[keys[rand]], keys[rand])
			}
			return null
		})
	}

	function setCurrentTrack(trackObject) {
		//log.update({msg: 'setting next track'})
		if (!trackObject) {
			//log.update({msg: 'track object was null'})
			return currentTrackRef.parent.child('track_playing').set(false).then(() => {
				return currentTrackRef.set(trackObject)
			})
		} else {
			//log.update({msg: 'track object found. setting...'})
			return currentTrackRef.set(trackObject)
		}

	}

	function mergeTrackWithUrl(trackObject, trackId) {
		//log.update({msg: 'merging track'})
		return admin.database().ref('song_urls/' + trackId).once('value').then(track => {
			const trackUrl = track.val()
			return Object.assign({}, trackObject, {url: trackUrl}, {key: trackId}, {startedAt: Date.now() + 200})
		})
	}
})
//var e = new XMLHttpRequest
//	, t = "https://us-central1-aux-io.cloudfunctions.net/trackEnded";
//t += "?roomId=" + "-KodKj_Relh6WThCJN4Y",
//	e.open("GET", t),
//	e.send()

//
//exports.afterUpload = functions.storage.object().onChange(event => {
//	if (event.data.resourceState === 'not_exists') {
//		return console.log('file deleted')
//	}
//	if (!event.data.contentType.startsWith('audio/')) {
//		return console.log('non audio file uploaded')
//	}
//
//	const object = event.data
//	const fileBucket = object.bucket; // The Storage bucket that contains the file.
//	const filePath = object.name; // File path in the bucket.
//	const fileName = path.basename(filePath) //the file name
//	const bucket = gcs.bucket(fileBucket);
//	const tempFilePath = path.join(os.tmpdir(), fileName);
//
//	//download the file that was just uploaded
//	return bucket.file(filePath).download({
//		destination: tempFilePath
//	}).then(() => {
//		console.log('Song downloaded locally to', tempFilePath);
//		bucket.file(filePath).getSignedUrl({
// //https://googlecloudplatform.github.io/google-cloud-node/#/docs/storage/1.2.0/storage/file?method=getSignedUrl
// action:  'read', expires: Date.now() + 86400000, //24 hours }).then(urls => { console.log('setting song url')
// admin.database().ref('song_urls/' + key).set(urls[0])  //temp: make the uploaded track the current track songObj.url
// = urls[0] admin.database().ref('room_data/1/current_track/').set() }) }) })