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

fb.on('value', rooms => {
	renderApp()
})


async function renderApp() {
	const rooms = await buildProps()
	ReactDOM.render(<App rooms={rooms}/>, document.getElementById('root'));
}


async function buildProps() {
	let users = {}
	let rooms = {}


	return new Promise(resolve => {
		//join room and room_data, this part is easy
		//for each user in room_users, join with users
		//room_users[x][y] = users[y]
		//join room and users
		//do this for each room and return the object

		resolve(merged)
	})


}


function join(id, paths, cb) {
	let returnedCount = 0
	let expectedCount = paths.length
	let mergedObject = {}
	return new Promise(resolve => {
		paths.forEach(p => {
			fb.child(`${p}/${id}`).on('value',
				snap => { //success
					Object.assign(mergedObject, snap.val())
					if (++returnedCount === expectedCount) {
						resolve(mergedObject)
					}
				},
				error => { //failure
					returnedCount = expectedCount + 1
					resolve(null)
				})
		})
	})

}

registerServiceWorker();

export const db = fb;
