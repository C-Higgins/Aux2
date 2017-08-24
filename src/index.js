import React from "react"
import ReactDOM from "react-dom"
import App from "./components/App"
import registerServiceWorker from "./registerServiceWorker"
import firebase from "firebase"

var config = {
	apiKey:            "AIzaSyDnSQaKs0nqBHXQVrsRZlKW3wO6FfZXtgs",
	authDomain:        "aux-io.firebaseapp.com",
	databaseURL:       "https://aux-io.firebaseio.com",
	projectId:         "aux-io",
	storageBucket:     "aux-io.appspot.com",
	messagingSenderId: "1016618940381"
};
firebase.initializeApp(config);
export default firebase;
//const fb_db = firebase.database.ref();
//const fb_storage = firebase.storage().ref();

firebase.auth().signInAnonymously().catch(error => {
	console.log(error)
})

firebase.auth().onAuthStateChanged(user => {
	if (user) {
		user.updateProfile({
			displayName: 'Anonymous'
		}).then(() => {
			ReactDOM.render(<App/>, document.getElementById('root'));

			//What is this?
			registerServiceWorker();
		})
	}
})



