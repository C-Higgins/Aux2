import React from "react"
import Chat from "./Chat.js"
import ReactTable from "react-table"
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
					id="queue"
					className="-striped"
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