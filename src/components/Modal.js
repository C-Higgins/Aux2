/**
 * Created by Chris on 7/9/2017.
 */


import React, {Component} from "react"
import Checkbox from "./Checkbox.js"
import '../css/Modal.css'
class Modal extends Component {
	constructor(props) {
		super(props)
		this.state = {
			private: false
		}

		this.togglePrivate = this.togglePrivate.bind(this)
	}

	togglePrivate() {
		this.setState(ps => ({
				private: !ps.private
			}
		))
	}

	render() {
		if (!this.props.open) {
			return null
		}
		return (
			<div className="modal">
				<i className="material-icons close" onClick={() => this.props.close()}>close</i>
				<div id="create-room">
					<label>Name</label><br/>
					<input type="text" className="copy-box" spellCheck={false} ref={(e => {
						this.nameBox = e
					})}/>

					<div className="col-2" id="modal-buttons">
						<div>
							<label>Private?</label><br/>
							<Checkbox checked={this.state.private} toggle={this.togglePrivate}/>
						</div>
						<i className="material-icons submit-btn"
						   onClick={() => this.props.submit(this.nameBox.value, this.state.private)}>
							play_circle_filled
						</i>
					</div>
				</div>
			</div>
		)
	}
}

export default Modal