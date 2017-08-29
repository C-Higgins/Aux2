import React, {Component} from "react"

class ProgressBar extends Component {
	//Props: startedAt, duration, [width]
	constructor(props) {
		super(props)
		this.width = props.width || 100
	}

	componentWillMount() {
		this.ticker = setInterval(() => {
			this.forceUpdate()
		}, 3000)
	}

	componentWillUnmount() {
		clearInterval(this.ticker)
	}

	render() {
		if (this.props.duration <= 0) {
			return null
		}


		const percentage = parseInt(((Date.now() - this.props.startedAt) / this.props.duration) * 100, 10) + '%'
		return (
			<div className="progress-bar" style={{width: this.width + '%'}}>
				<div className="progress-indicator"
					 style={{left: percentage}}
				/>
			</div>
		)
	}
}

export default ProgressBar