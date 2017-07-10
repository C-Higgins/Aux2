import React from "react"
import Chat from "./Chat.js"
import ReactTable from "react-table"
import Player from "react-sound"
import "react-table/react-table.css"

function RoomPage(props) {
	const columns = [{
		Header:   'Title',
		accessor: 'title' // String-based value accessors!
	}, {
		Header:   'Artist',
		accessor: 'artist'
	}, {
		Header:   'Album',
		accessor: 'album' // Custom value accessors!
	}, {
		Header:    'Time', // Custom header components!
		accessor:  'time',
		resizable: false,
		width:     80,
	}]


	return (
		<div id="room-container">
			<Player
				url="https://firebasestorage.googleapis.com/v0/b/aux-io.appspot.com/o/02%20She%20Was%20Too%20Good%20To%20Me.mp3?alt=media&token=725d8d47-347e-433c-b81d-049a79511379"
				playFromPosition={100000}
				playStatus="PLAYING"
			/>
			<div id="music">
				<div id="now-playing">
					<div id="img-container">
						<img className="pic"
							 alt="np_album"
							 src="http://d817ypd61vbww.cloudfront.net/sites/default/files/styles/media_responsive_widest/public/tile/image/AbbeyRoad.jpg"
						/>
					</div>
					<div id="right">
						<div id="music-info">
							Lucy in the Sky with Diamonds <br/>
							<small>The Beatles <br/> Sgt. Pepper's Lonely Hearts Club Band, 1967</small>
						</div>
						<div id="controls">
							controls
						</div>
					</div>
				</div>
				<ReactTable
					className="-striped queue"
					data={[]}
					columns={columns}
					resizable={true}
					showPaginationBottom={false}
				/>
				<div id="upload">
					upload
				</div>
			</div>
			<Chat messages={props.messages} sendChat={props.sendChat}/>
		</div>
	)
}

export default RoomPage