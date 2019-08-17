import React from 'react'
import {findById} from './RuntimeReader'
export interface IExtViewProps{
    id:string;
}
import "./ext-view.css"
import { ValineComment } from '../../lib/controls';
import { IExtInfo } from './ExtInfo';
import PicSwiper from './PicSwiper'
export default class ExtView extends React.Component<IExtViewProps>{
    render(){
        let ext = findById(this.props.id);
        document.title = ext.name + "-秋之盒模块";
        return <div className="container">
            <div className="row">
                <div className="col-sm-2 col-5">
                    <img style={{width:"100%",maxHeight:"100%"}} src={"/images/ext_icons/" + ext.icon}></img>
                </div>
                <div className="col-sm-10 col-7">
                    <h1>{ext.name}</h1>
                    <h3>v{ext.version || "1.0.0"} @{ext.auth}</h3>
                    <a href={ext.downloadUrl}><button className="btn btn-success">下载</button></a>
                </div>
            </div>
            <br/>
            <AddtionPanel extInfo={ext}></AddtionPanel>
            <br/>
            <p dangerouslySetInnerHTML={{__html:ext.desc}}></p>
            <br/>
            <PicturesView extInfo={ext}></PicturesView>
            <br/><br/>
            <ValineComment path={"/exts/" + ext.id}></ValineComment>
        </div>
    }
}
interface IExtInfoProps{
    extInfo:IExtInfo;
}
class AddtionPanel extends React.Component<IExtInfoProps>{
    render(){
        return <div className="row">
            {this.generateViews()}
        </div>
    }
    private generateViews(){
        let views = [];
        let addtion =this.props.extInfo.addition;
        for(let key in addtion){
            views.push(<div className="col-sm-3 col-6">{key}:<span dangerouslySetInnerHTML={{__html:addtion[key]}}></span></div>);
        }
        return views;
    }
    
}
class PicturesView extends React.Component<IExtInfoProps>{
    render(){
        if(this.props.extInfo.pics){
            return <PicSwiper srcs={this.props.extInfo.pics}></PicSwiper>
        }else{
            return null;
        }
    }
}