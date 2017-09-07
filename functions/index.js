const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
//const gcs = require('@google-cloud/storage')//(SAC go here);
const path = require('path');
const fs = require('fs');
admin.initializeApp(functions.config().firebase);
let TRACK_ENDED_TIMESTAMP = null


exports.roomHandler = functions.database.ref('/room_data/{rId}/songs/uploaded/{sId}').onCreate(event => {
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
			const [trackUrl, trackObject] = results

			const newTrackObject = Object.assign({}, trackObject.val(), {url: trackUrl.val()}, {key: songId}, {startedAt: Date.now() + 100})
			console.log('setting track')
			//otherwise make it play
			return admin.database().ref('room_data/' + roomId).update({
				current_track: newTrackObject,
				track_playing: true,
			})
		})
	})
})
