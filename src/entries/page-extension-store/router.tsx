import React from 'react'
import ExtView from './ExtView'
import ExtStore from './ExtStore'
import ReactDOM from 'react-dom'
import {HashRouter as Router,Switch,Route} from 'react-router-dom'

const ExtRouter = ()=><Router>
    <Switch>
        <Route path="/:id" component={ExtView}></Route>
        <Route path="*" component={ExtStore}></Route>
    </Switch>
</Router>

export default function renderTo(element:HTMLDivElement) {
    ReactDOM.render(<ExtRouter/>,element);
}