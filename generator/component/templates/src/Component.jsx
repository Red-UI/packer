import React, { Component, PropTypes } from 'react'
import './<%= camelComponentName %>.less'

export default class <%= camelComponentName %> extends Component {
  static displayName = "<%= camelComponentName %>"

  static propTypes = {
    foo: PropTypes.string
  }

  static defaultProps = {

  }

  state = {}

  componentDidMount() {

  }

  render() {
    const { children, ...others } = this.props
    return (
      <div className="<%= kebabComponentName %>" {...others} >
        {children}
      </div>
    )
  }
}