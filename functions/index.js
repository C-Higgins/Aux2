const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
//const gcs = require('@google-cloud/storage')//(SAC go here);
const path = require('path');
const fs = require('fs');
admin.initializeApp();


exports.roomHandler = functions.database.ref('/room_data/{rId}/songs/uploaded/{sId}').onCreate((data, context) => {
	const roomId = context.params.rId
	const songId = context.params.sId
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
			admin.database().ref('rooms/' + roomId).update({
				current_track: newTrackObject,
				track_playing: true,
			})
			return admin.database().ref('room_data/' + roomId).update({
				current_track: newTrackObject,
				track_playing: true,
			})
		})
	})
})

exports.userCount = functions.database.ref('room_data/{rId}/users').onWrite((data, context) => {
	const roomId = context.params.rId
	const usersRef = admin.database().ref('room_data/' + roomId + '/users')
	return usersRef.once('value').then(users => {
		const numUsers = users.exists() ? Object.keys(users.val()).length : 0
		return admin.database().ref(`rooms/${roomId}/numUsers`).set(numUsers)
	})
})

// The node server will listen for the vote count and skip if warranted
exports.voteTracker = functions.database.ref('/room_data/{rId}/users/{uId}/vote').onWrite((data, context) => {
	const roomId = context.params.rId
	const roomVotesRef = admin.database().ref('room_data/' + roomId + '/votes')
	return roomVotesRef.once('value').then(roomVotes => {
		// when a user changes their vote,
		// if they voted yes, check if it is past the threshold and do stuff
		// if they vote no, just update the votes number
		if (!!data.after.val()) { 								//user voted
			return roomVotesRef.transaction(currentVotes => {
				return (currentVotes || 0) + 1
			})
		} else if (!!data.before.val() && roomVotes.val() > 0) { 	// User rescinded their vote
			return roomVotesRef.transaction(currentVotes => {
				return (currentVotes || 0) - 1
			})
		}
	})
})

exports.clearVotes = functions.database.ref('/room_data/{rId}/current_track').onWrite((data, context) => {
	// dont clear it if it's the same track
	if (data.before.exists() && data.after.exists() && data.before.val().key === data.after.val().key) {
		return false;
	}
	const roomId = context.params.rId
	const roomVotesRef = admin.database().ref('room_data/' + roomId + '/votes')
	const usersRef = admin.database().ref(`room_data/${roomId}/users`)
	return usersRef.once('value').then(users => {
		if (!users.exists()) return false
		roomVotesRef.set(0)
		let updates = {}
		Object.keys(users.val()).forEach(uId => {
			updates[uId + '/vote'] = false
		})
		return usersRef.update(updates)
	})
})
