import React, {Component} from "react"
import '../css/Modal.css'

class Modal extends Component {
	render() {
		return (
			<div className="modal">
				<i className="material-icons close" onClick={() => this.props.close()}>close</i>
				{this.props.body}
			</div>
		)
	}
}

export default Modal