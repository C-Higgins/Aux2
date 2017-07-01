import React, {Component} from 'react';
import '../css/App.css';
import {db} from '../index.js'
import Lobby from './Lobby.js'
import Room from './Room.js'

class App extends Component {

	constructor(props) {
		super(props)
        this.state = {...props}
	}

    createRoom(name) {
        let key = db.child('rooms').push().key
        db.child('/rooms/' + key).set({
            room_name: name,
            private: false,
        })
        db.child('/room_data/' + key).set({
            track_playing: false,
            current_track: null,
            songs: {},
        })
        db.child('/room_users/' + key).set({
            u1: true,
        })
        db.child('/users/u1/rooms').set({
            key: true,
        })
    }

    componentWillMount() {
        db.on('value', data => {
            this.setState({...data.val()})
        })
	}

	render() {
        const mergedLobbyData = Object.keys(this.state.rooms).map(key => {
            return Object.assign({}, this.state.rooms[key], this.state.room_data[key], {users: Object.keys(this.state.room_users[key]).length})
        })

		return (
            <Lobby rooms={mergedLobbyData}/>
		);
	}
}

export default App;
