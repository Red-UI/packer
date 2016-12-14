'use strict'

import React, { Component, PropTypes } from 'react'

export default class extends Component {
  static propTypes = {
    link: PropTypes.string
  }

  static defaultProps = {
    link: '##'
  }

  render() {
    const { link } = this.props

    return (
      <a href={link}>This is component Hello.</a>
    )
  }
}