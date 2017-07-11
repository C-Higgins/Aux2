import React, {Component} from "react"
import Chat from "./Chat.js"
import ReactTable from "react-table"
import Player from "react-sound"
import reader from "jsmediatags"
import "react-table/react-table.css"

class RoomPage extends Component {

	// constructor(props) {
	// 	super(props)

	// }

	static columns = [{
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

	componentWillMount() {
		reader.read(this.props.url, {
			onSuccess: function (tag) {
				console.log(tag);
			},
			onError:   function (error) {
				console.log(':(', error.type, error.info);
			}
		});
	}


	render() {
		return (
			<div id="room-container">
				{/*"https://firebasestorage.googleapis.com/v0/b/aux-io.appspot.com/o/02%20She%20Was%20Too%20Good%20To%20Me.mp3?alt=media&token=725d8d47-347e-433c-b81d-049a79511379"
				 http://d817ypd61vbww.cloudfront.net/sites/default/files/styles/media_responsive_widest/public/tile/image/AbbeyRoad.jpg*/}
				<Player
					url={this.props.url}
					//playFromPosition={Date.now() - this.props.startedAt}
					playFromPosition={100000}
					playStatus="PLAYING"
					onPlaying={(sm2) => {
						console.log(sm2)
					}}
				/>
				<div id="music">
					<div id="now-playing">
						<div id="img-container">
							<img className="pic"
								 alt="np_album"
								 src={this.props.albumURL}
							/>
						</div>
						<div id="right">
							<div id="music-info">
								{this.props.title}<br/>
								<small>{this.props.artist}<br/>{this.props.album}, {this.props.year}</small>
							</div>
							<div id="controls">
								controls
							</div>
						</div>
					</div>
					<ReactTable
						className="-striped queue"
						data={[]}
						columns={RoomPage.columns}
						resizable={true}
						showPaginationBottom={false}
					/>
					<div id="upload">
						upload
					</div>
				</div>
				<Chat messages={this.props.messages} sendChat={this.props.sendChat}/>
			</div>
		)
	}
}

export default RoomPage