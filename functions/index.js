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
	console.log('room creation spotted at', roomEvent.params.rId)
	const currentTrackRef = admin.database().ref('room_data/' + roomEvent.params.rId + '/current_track')
	const roomId = roomEvent.params.rId

	//wait for song upload
	return functions.database.ref('/room_data/' + roomId + '/songs/{sId}').onCreate(trackEvent => {
		console.log('song created:', trackEvent.params.sId)
		const songId = trackEvent.params.sId

		//check if song is currently playing
		return currentTrackRef.once('value', ct => {
			//do nothing if it is
			if (!ct.exists()) {
				return;
			}
			console.log('no current track')
			//otherwise make it play
			const playTrack_pr = admin.database().ref('song_urls/' + songId).once('value')
			playTrack_pr.then(track => {
				const trackUrl = track.val()
				const trackObject = Object.assign({}, trackEvent.data.val(), {url: trackUrl})
				console.log('setting track')
				return currentTrackRef.set(trackObject)
			})

			//and set the timer for its duration
			const setTimer_pr = admin.database().ref(`song_data/${roomId}/${songId}`).once('value')
			setTimer_pr.then(track => {
				return setTimer(afterSongEnds(roomId), track.val().duration * 1000)
			})

			return Promise.all([playTrack_pr, setTimer_pr])
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