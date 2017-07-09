import React, {Component} from "react"
class Checkbox extends Component {
	constructor(props) {
		super(props)
		this.state = {
			checked: false
		}
	}




	render() {
		return (
			<div className="checkbox"
				 onClick={() => this.props.toggle()}>
				{this.props.checked && '✓'}
			</div>
		)
	}
}

export default Checkbox