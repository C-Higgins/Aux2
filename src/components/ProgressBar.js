import React, {PureComponent} from "react"
import PB from "react-progressbar.js"

class ProgressBar extends PureComponent {
	//Props: startedAt, duration
	constructor(props) {
		super(props)
		this.state = {
			percentage: ProgressBar.getPercentage(props.startedAt, props.duration)
		}
	}

	componentWillMount() {
		this.ticker = setInterval(() => {
			this.tick()
		}, 3000)
	}

	componentWillReceiveProps(np) {
		if (np.duration !== this.props.duration || np.startedAt !== this.props.startedAt) {
			clearInterval(this.ticker)
			this.ticker = setInterval(() => {
				this.tick()
			}, 3000)
		}

	}

	tick() {

		const percentage = ProgressBar.getPercentage(this.props.startedAt, this.props.duration)
		if (percentage === 1) {
			clearInterval(this.ticker)
		}
		this.setState({percentage: percentage})
	}

	componentWillUnmount() {
		clearInterval(this.ticker)
	}

	static getPercentage(startedAt, duration) {
		return Math.max(Math.min((Date.now() - startedAt) / (duration * 1000), 1), 0)
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