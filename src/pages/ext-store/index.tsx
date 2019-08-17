import React from 'react'
import ReactDOM from 'react-dom'
import Store from './Store';
import {getUrlParam} from '../../lib/url-handler'
import ExtView from './ExtView';
import { StdLayout } from '../../lib/controls';
class ExtStore extends React.Component{
    render(){
        if(getUrlParam("id")){
            return <StdLayout><ExtView id={getUrlParam("id")}></ExtView></StdLayout>
        }else{
            return <StdLayout><Store></Store></StdLayout>
        }
    }
}
ReactDOM.render(<ExtStore></ExtStore>,document.querySelector("#app"));