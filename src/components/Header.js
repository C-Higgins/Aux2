import React from 'react'
import AsyncComponent from "./AsyncComponent"
import firebase from "../index.js"
import {Link} from "react-router-dom"
import '../css/Header.css'

const Modal = (props) => <AsyncComponent load={import('./CreateRoomModal')} {...props}/>

class Header extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			modalOpen: false,
		}
		this.fb = firebase.database().ref();
		this.createRoom = this.createRoom.bind(this)
	}

	//TODO: Make passwords do something
	createRoom(name, password) {
		const key = this.fb.child('rooms').push().key
		const user = firebase.auth().currentUser
		const newRoom = {
			room_name: name,
			private:   !!password,
			password:  password,
			numUsers:  1,
		}
		const newRoomData = {
			track_playing: false,
			current_track: {},
			songs:         {},
			votes:         0,
			users:         {
				[user.uid]: {
					displayName: user.displayName,
					vote:        false,
				}
			}
		}

		//TODO: Link to new room without page reload
		const p1 = this.fb.child('/rooms/' + key).set(newRoom)
		const p2 = this.fb.child('/room_data/' + key).set(newRoomData)
		Promise.all([p1, p2,]).then(() => {
			window.location = '/' + key;
		})
	}

	openModal = () => {
		this.setState({modalOpen: true})
	}

	render() {
		return <div id="header">
			{
				this.state.modalOpen &&
				<Modal submit={this.createRoom}
					   close={() => this.setState({modalOpen: false})}
				/>
			}
			<div className="wrapper header">
				<Link to="/"><span id="aux">Aux</span></Link>
				<div id="buttons">
					<i className="material-icons lobby-button" onClick={this.openModal}>
						add_circle_outline
					</i>
					<i className="material-icons lobby-button">
						settings
					</i>
				</div>
			</div>
		</div>
	}
}

export default Header