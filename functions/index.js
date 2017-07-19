const functions = require('firebase-functions');
const admin = require('firebase-admin');
const gcs = require('@google-cloud/storage')//(SAC go here);
const path = require('path');
const os = require('os');
const fs = require('fs');
const mm = require('musicmetadata');
admin.initializeApp(functions.config().firebase);


exports.roomHandler = functions.database.ref('/rooms/{rId}').onCreate(roomEvent => {
	/*
	 two scenarios
	 1:
	 user uploads first song
	 start it immediately by setting current song to that
	 set timer for song duration
	 2:
	 song is playing and user uploads song
	 wait for timer to end and then choose the next song
	 */
	const currentTrackRef = admin.database().ref('room_data/' + roomEvent.params.rId + '/current_track')
	const roomId = event.params.rId

	//wait for song upload
	functions.database.ref('/room_data/' + roomId + '/songs/{sId}').onCreate(trackEvent => {
		const songId = trackEvent.params.sId

		//check if song is currently playing
		currentTrackRef.once('value', ct => {
			//do nothing if it is
			if (!ct.exists()) {
				return false;
			}
			//otherwise make it play
			admin.database().ref('song_urls/' + songId).once('value').then(track => {
				const trackUrl = track.val()
				const trackObject = Object.assign({}, trackEvent.data.val(), {url: trackUrl})
				currentTrackRef.set(trackObject)
			})

			//and set the timer for its duration
			admin.database().ref(`song_data/${roomId}/${songId}`).once('value').then(track => {
				setTimer(afterSongEnds(roomId), track.val().duration * 1000)
			})
		})
	})

	// after track ends, start the next one
	function afterSongEnds(roomId) {
		getNextTrack(roomId).then(nextTrack => {
			setCurrentTrack(nextTrack)
			setTimer(afterSongEnds(), nextTrack.duration * 1000)
		})
	}

	function getNextTrack(roomKey) {
		admin.database().ref('song_data/' + roomKey).once('value').then(ss => {
			const keys = Object.keys(ss.val())
			const numberOfSongs = keys.length
			const rand = Math.floor(Math.random() * numberOfSongs)
			mergeTrackWithUrl(ss.val()[keys[rand]], keys[rand]).then(trackObject => {
				return trackObject
			})
		})
	}

	function setCurrentTrack(roomKey, trackObject) {
		admin.database().ref('room_data/' + roomKey + '/current_track').set(trackObject)
	}

	function mergeTrackWithUrl(trackObject, trackId) {
		admin.database().ref('song_urls/' + trackId).once('value').then(track => {
			const trackUrl = track.val()
			const mergedTrackObject = Object.assign({}, trackObject, {url: trackUrl})
			return mergedTrackObject
		})
	}

});
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