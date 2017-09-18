import React, {Component} from "react"
import '../css/Modal.css'

class Modal extends Component {
	render() {
		return (
			<div className="modal">
				<i className="material-icons close" onClick={() => this.props.close()}>close</i>
				<div id="create-room">
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
			</div>
		)
	}
}

export default Modal