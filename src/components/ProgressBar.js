import React, {Component} from "react"

class ProgressBar extends Component {
	//Props: startedAt, duration

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

		const percentage = parseInt((Date.now() - this.props.startedAt) / (this.props.duration * 10), 10) + '%'
		return (
			<div className="progress-bar">
				<div className="progress-indicator"
					 style={{width: percentage}}
				/>
			</div>
		)
	}
}

export default ProgressBar