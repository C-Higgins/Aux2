import React from 'react'

class AsyncComponent extends React.Component {
	constructor(props) {
		super(props)
		this.cancelUpdate = false
		this.props.load.then((c) => {
			this.Comp = c
			if (!this.cancelUpdate) {
				this.forceUpdate()
			}
		})
	}

	componentWillUnmount() {
		this.cancelUpdate = true
	}

	render() {
		const {load, ...desiredProps} = this.props
		return this.Comp ? <this.Comp.default {...desiredProps}/> : null
	}
}

export default AsyncComponent