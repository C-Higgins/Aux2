const functions = require('firebase-functions');
const admin = require('firebase-admin');
const gcs = require('@google-cloud/storage')//(SAC go here);
const path = require('path');
const os = require('os');
const fs = require('fs');
const mm = require('musicmetadata');
admin.initializeApp(functions.config().firebase);


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

			const newTrackObject = Object.assign({}, trackObject, {url: trackUrl})
			console.log('setting track')
			//otherwise make it play
			return currentTrackRef.set(newTrackObject).then(() => {
				console.log('setting timer')
				//and set the timer for its duration
				return setTimer(afterSongEnds(roomId), track.val().duration * 1000)
			})

		})
	})
})

// after track ends, start the next one
function afterSongEnds(roomId) {
	console.log('song ended')
	//TODO: delete previous track in here
	return getNextTrack(roomId).then(nextTrack => {
		setCurrentTrack(nextTrack)
		return setTimer(afterSongEnds(), nextTrack.duration * 1000)
	})
}

function getNextTrack(roomKey) {
	console.log('getting next track')
	return admin.database().ref('song_data/' + roomKey).once('value').then(ss => {
		const keys = Object.keys(ss.val())
		const numberOfSongs = keys.length
		const rand = Math.floor(Math.random() * numberOfSongs)
		return mergeTrackWithUrl(ss.val()[keys[rand]], keys[rand])
	}).then(trackObject => {
		return trackObject
	})
}

function setCurrentTrack(roomKey, trackObject) {
	console.log('setting next track')
	return currentTrackRef.set(trackObject)
}

function mergeTrackWithUrl(trackObject, trackId) {
	console.log('merging track')
	return admin.database().ref('song_urls/' + trackId).once('value').then(track => {
		const trackUrl = track.val()
		const mergedTrackObject = Object.assign({}, trackObject, {url: trackUrl})
		return mergedTrackObject
	})
}

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