import React, {Component} from 'react';
import '../css/App.css';
import {db} from '../index.js'
import Lobby from './Lobby.js'

class App extends Component {

	constructor(props) {
		super(props)
		this.state = {}
	}


	componentWillMount() {

	}

	addUser(obj) {
		db.child('users').set(obj)
	}

	render() {
		return (
			<Lobby {...this.props}/>
		);
	}
}

export default App;
