'use strict'

import React, { Component, PropTypes } from 'react'
import Hello from '../../components/Hello'
import './Home.less'

export default class extends Component {

  render() {
    return (
      <div className="home-page">
        <h1>Home Page</h1>
        <Hello link="https://github.com/Red-UI/notes/issues" />
      </div>
    )
  }
}