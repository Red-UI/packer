import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import <%= camelComponentName %> from '../src'

class DemoSimple extends Component {

  render() {
    return (
      <<%= camelComponentName %>>Demo Simple</<%= camelComponentName %>>
    )
  }
}

ReactDOM.render(
  <DemoSimple />,
  document.getElementById('red-ui-entry')
)