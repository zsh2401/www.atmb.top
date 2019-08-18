import React from 'react'
import { StdLayout, ValineComment } from '../../lib/controls';
import RuntimeReader from './RuntimeReader'
import { IExtInfo } from './ExtInfo';
import "./index.css"
import { string } from 'prop-types';
export default class Store extends React.Component{
    render(){
        return <div>
            <div className="header text-center">
                <h1>下载秋之盒拓展模块</h1>
                <p>做你想做的事</p>
            </div>
            <br/>
            <div className="container">
                <div className="row">
                    {getExtViews()}
                </div>
                <br/><br/>
                <h3>说点什么吧</h3>
                <ValineComment></ValineComment>
            </div>
        </div>
    }
}
function getExtViews(){
    let result = [];
    RuntimeReader().forEach(extInfo=>{
        result.push(<ExtView extInfo={extInfo}></ExtView>)
    })
    return result;
}
interface IExtViewProps{
    extInfo:IExtInfo
}
class ExtView extends React.Component<IExtViewProps>{
    render(){
        return <div className="col-sm-4 col-12">
            <div className="row ext-card" onClick={()=>{window.open("?id=" + this.props.extInfo.id)}}>
                <div className="col-3 d-flex h-100">
                    <img className="ext-icon justify-content-center align-self-center" src={"/images/ext_icons/" + this.props.extInfo.icon}></img>
                </div>
                <div className="col-9 d-flex h-100">
                    <div className="justify-content-center align-self-center">
                        <h5>{this.props.extInfo.name}</h5>
                        <p>{this.props.extInfo.bdesc || this.props.extInfo.desc.substr(0,15)}</p>
                    </div>
                </div>
            </div>
        </div>
    }
}