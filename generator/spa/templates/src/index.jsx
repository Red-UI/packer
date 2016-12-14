'use strict'

import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, IndexRoute, hashHistory, Redirect } from 'react-router'
import HomePage from './pages/Home'

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/">
      <IndexRoute component={HomePage} />
    </Route>
  </Router>,
  document.querySelector('#react-entry')
)