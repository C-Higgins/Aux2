import React, {Component} from "react"
import PB from "react-progressbar.js"

class ProgressBar extends Component {
	//Props: startedAt, duration
	constructor(props) {
		super(props)
		this.state = {
			percentage: Math.min((Date.now() - this.props.startedAt) / (this.props.duration * 1000), 1),
			done: false,
		}
	}

	componentWillMount() {
		this.ticker = setInterval(() => {
			this.tick()
		}, 3000)
	}

	componentWillReceiveProps(np){
		this.setState({done:false})
		clearInterval(this.ticker)
		this.ticker = setInterval(() => {
			this.tick()
		}, 3000)
	}

	tick() {
		if (this.state.done) {
			clearInterval(this.ticker)
			return
		}
		const percentage = Math.max(Math.min((Date.now() - this.props.startedAt) / (this.props.duration * 1000), 1), 0)
		if (percentage === 1){
			this.setState({done: true})
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