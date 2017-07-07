import React, {Component} from "react"
class Checkbox extends Component {
	constructor(props) {
		super(props)
		this.state = {
			checked: false
		}

		this.toggle = this.toggle.bind(this)
	}


	toggle() {
		this.setState(ps => ({
				checked: !ps.checked
			}
		))
	}

	render() {
		return (
			<div className="checkbox"
				 onClick={this.toggle}>
				{this.state.checked && '✓'}
			</div>
		)
	}
}

export default Checkbox