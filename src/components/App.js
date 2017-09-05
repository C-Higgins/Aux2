import React from "react"
import {BrowserRouter as Router, Route} from "react-router-dom"
import Header from './Header'
import AsyncComponent from './AsyncComponent'
import "../css/App.css"

const LobbyAsync = (props) => <AsyncComponent load={import('./Lobby.js')} {...props}/>
const RoomAsync = (props) => <AsyncComponent load={import('./Room.js')} {...props}/>

const App = (props) => {
	return (
		<Router>
			<div className="wrapper">
				<Header/>
				<Route exact path="/" component={LobbyAsync}/>
				<Route path="/:roomId" component={RoomAsync}/>
			</div>
		</Router>
	)
}

export default App;
