import React from "react"
import Modal from './Modal'

class CreateRoomModal extends React.Component {
	render() {
		const body = (
			<div className="modal-body">
				<label>Room Name</label><br/>
				<input type="text" className="copy-box" spellCheck={false} ref={(e => {
					this.nameBox = e
				})}/>
				<label>Password?</label><br/>
				<input type="password" placeholder="None" className="copy-box" spellCheck={false} ref={(e => {
					this.passwordBox = e
				})}/>

				<div id="modal-buttons">
					<i className="material-icons submit-btn"
					   onClick={() => this.props.submit(this.nameBox.value, this.passwordBox.value)}>
						play_circle_filled
					</i>
				</div>
			</div>
		)

		return (
			<Modal
				{...this.props}
				body={body}
			/>
		)
	}
}

export default CreateRoomModal