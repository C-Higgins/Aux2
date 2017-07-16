const functions = require('firebase-functions');
const admin = require('firebase-admin');
const gcs = require('@google-cloud/storage')(process.env.SERVICE_ACCOUNT_CRED);
const path = require('path');
const os = require('os');
const fs = require('fs');
const mm = require('musicmetadata');
admin.initializeApp(functions.config().firebase);


//exports.makeUppercase = functions.database.ref('/messages/{roomId}/{mId}')
//.onCreate(event => {
//	// Grab the current value of what was written to the Realtime Database.
//	let message = event.data.val();
//	message.message = message.message.toUpperCase();
//	// You must return a Promise when performing asynchronous tasks inside a Functions such as
//	// writing to the Firebase Realtime Database.
//	// Setting an "uppercase" sibling in the Realtime Database returns a Promise.
//	let key = admin.database().ref('messages/' + event.params.roomId).push()
//	//woops I had an infloop
//});
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