import React from 'react'
import ReactDOM from 'react-dom'
import {getUrlParam} from '../../lib/url-handler'
import { StdLayout } from '../../lib/controls';
import goRecord from "./record.json";
let key = getUrlParam("a");
let url = goRecord[key];
class CanNotGoToTheTargetPage extends React.Component{
    render(){
        return <StdLayout>
            <div className="container">
                <h1 className="text-center">无法跳转到指定页面
                <br/>
                <a className="text-center" href="/">回到主页</a>
                </h1>
               
            </div>
        </StdLayout>
    }
}
if(url){
    window.location.href = url;
}else{
    ReactDOM.render(<CanNotGoToTheTargetPage></CanNotGoToTheTargetPage>,document.querySelector("#app"))
}
