const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


exports.makeUppercase = functions.database.ref('/messages/{roomId}/{mId}')
.onCreate(event => {
	// Grab the current value of what was written to the Realtime Database.
	let message = event.data.val();
	message.message = message.message.toUpperCase();
	// You must return a Promise when performing asynchronous tasks inside a Functions such as
	// writing to the Firebase Realtime Database.
	// Setting an "uppercase" sibling in the Realtime Database returns a Promise.
	let key = admin.database().ref('messages/' + event.params.roomId).push()
	//woops I had an infloop
});