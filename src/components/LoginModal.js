import React from "react"
import Modal from './Modal'

function LoginModal(props) {
	const body = (
		<div className="modal-body">
			Join private room
		</div>
	)

	return (
		<Modal
			{...props}
			body={body}
		/>
	)
}

export default LoginModal