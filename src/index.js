import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import firebase from 'firebase'

var config = {
	apiKey:            "AIzaSyDnSQaKs0nqBHXQVrsRZlKW3wO6FfZXtgs",
	authDomain:        "aux-io.firebaseapp.com",
	databaseURL:       "https://aux-io.firebaseio.com",
	projectId:         "aux-io",
	storageBucket:     "aux-io.appspot.com",
	messagingSenderId: "1016618940381"
};
firebase.initializeApp(config);

const fb = firebase.database().ref();
fb.on('value', (snapshot => {
	const store = snapshot.val()
	ReactDOM.render(<App {...store}/>, document.getElementById('root'));
}))

registerServiceWorker();

export const db = fb;
