import React from 'react';
function RoomPage(props) {
	return (
		<div id="room-container">
			<div id="music">
				<div id="now-playing">
					<img className="pic"
						 alt="np_album"
						 src="http://d817ypd61vbww.cloudfront.net/sites/default/files/styles/media_responsive_widest/public/tile/image/AbbeyRoad.jpg"
					/>
					<div id="right">
						<div id="music-info">
							The Beatles - Lucy in the Sky with Diamonds <br/>
							<small>Sgt. Pepper's Lonely Hearts Club Band, 1967</small>
						</div>
						<div id="controls">
							controls
						</div>
					</div>
				</div>
				<div id="queue">
					<div id="queueTable">
						<div id="queueHeader">
							<span className="player">Title</span>
							<span className="rating">Artist</span>
							<span className="time">Album</span>
							<span className="mode">Time</span>
						</div>
						<div id="queueRows">
							<div className="row">
								<span>row1</span>
								<span>row1</span>
								<span>row1</span>
							</div>
							<div className="row">
								<span>row2</span>
								<span>row2</span>
								<span>row2</span>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div id="chat">
				chat
			</div>
		</div>
	)
}

export default RoomPage