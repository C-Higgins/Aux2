import React, {Component} from "react"
import PB from "react-progressbar.js"

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

		const percentage = (Date.now() - this.props.startedAt) / (this.props.duration * 1000)
		return (
			<PB.Line
				progress={percentage}
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