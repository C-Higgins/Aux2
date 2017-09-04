import React, {Component} from "react"
import PB from "react-progressbar.js"

class ProgressBar extends Component {
	//Props: startedAt, duration
	constructor(props) {
		super(props)
		this.state = {percentage: Math.min((Date.now() - this.props.startedAt) / (this.props.duration * 1000), 1)}
	}

	componentWillMount() {
		clearInterval(this.tick())
		this.ticker = setInterval(() => {
			this.tick()
		}, 3000)
	}

	tick() {
		if (this.props.startedAt < Date.now()) {
			var percentage = Math.min((Date.now() - this.props.startedAt) / (this.props.duration * 1000), 1)
		}
		if (percentage === 1) {
			clearInterval(this.ticker)
		}
		this.setState({percentage: percentage})
	}

	componentWillUnmount() {
		clearInterval(this.ticker)
	}

	render() {
		if (this.props.duration <= 0) {
			return null
		}

		return (
			<PB.Line
				progress={this.state.percentage}
				options={
					{
						strokeWidth: 1.5,
						easing:      'easeInOut',
						color:       '#560e0e',
						trailColor:  'white',
						trailWidth:  1.5,
					}
				}
			/>
		)
	}
}

export default ProgressBar