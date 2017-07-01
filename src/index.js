import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import firebase from 'firebase'

var config = {
    apiKey: "AIzaSyDnSQaKs0nqBHXQVrsRZlKW3wO6FfZXtgs",
    authDomain: "aux-io.firebaseapp.com",
    databaseURL: "https://aux-io.firebaseio.com",
    projectId: "aux-io",
    storageBucket: "aux-io.appspot.com",
    messagingSenderId: "1016618940381"
};
firebase.initializeApp(config);

const fb = firebase.database().ref();
fb.once('value', data => {
    ReactDOM.render(<App {...data.val()}/>, document.getElementById('root'));
})


// function buildProps() {
//     let roomWithEverything, roomWithUsers, roomWithData
//     return new Promise(resolve => {
//         let roomsList = new Promise(resolve => {
//                 fb.child('rooms').once('value', rooms => {
//                     resolve(rooms.val())
//                 })
//             }
//         )
//
//         roomsList.then(roomList => {
//             Object.keys(roomList).forEach((key) => {
//                 roomWithData = new Promise(res => {
//                     fb.child('room_data/' + key).once('value', data => {
//                         roomList[key] = Object.assign({}, roomList[key], data.val())
//                         res(roomList[key])
//                     })
//                 })
//
//                 roomWithUsers = new Promise(res => {
//                     fb.child('room_users/' + key).once('value', users => {
//                         roomList[key] = Object.assign({}, roomList[key], {users: users.val()})
//                         res(roomList[key].users)
//                     })
//                 })
//
//                 roomWithEverything = new Promise(res => {
//                     roomWithUsers.then(async users => {
//                         await Promise.all(Object.keys(users).map(async(key) => {
//                             await fb.child('users/' + key).once('value', userData => {
//                                 users[key] = userData.val()
//                             })
//                         }));
//                         res(users)
//                     })
//                 })
//             })
//             Promise.all([roomWithEverything, roomWithUsers, roomWithData]).then(() => {
//                 resolve(roomsList)
//             })
//         })
//     })
// }


registerServiceWorker();

export const db = fb;
