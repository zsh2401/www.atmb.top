import React, { ReactNode } from 'react'
import ReactDOM from 'react-dom'
import {StdLayout} from '../../lib/controls'
import "./dlv2.css"
class PageDLV2 extends React.Component{
    render():ReactNode{
        let dlInfo = getDLInfo();
        return <StdLayout>
            <div className="header text-center text-white">
                <h1>下载 秋之盒{dlInfo.versionName}</h1>
                <a className="text-white" href="/download">返回老版本下载页面</a>
            </div>
            <div className="container">
                <div className="desc">
                    <br/><br/>
                    <h4>秋之盒-{dlInfo.versionName}-主要包含以下特性与更新:</h4>
                    <ul>
                        {dlInfo.updates.map(u=>{
                            return <li>{u}</li>
                        })}
                    </ul>
                    <div>
                        <a href={dlInfo.url}><button className="btn btn-success">下载Win 64位版本</button></a>
                        <span> </span>
                        <a href={dlInfo.url32}><button className="btn btn-warning text-white">下载Win 32位版本</button></a>
                        <br/>
                        
                        <a href="/beta">尝鲜BETA测试版本</a>
                    </div>
                </div>
            </div>
        </StdLayout>
    }
}
function getDLInfo():DLInfo{
    return {
        versionDate:"8/26/2019",
        versionName:"2019.9",
        url32:"",
        url:"",
        updates:[
            "界面革新",
            "大量BUG修复",
            "秋之盒SDK更新至9.0.1",
            "CPU与内存占用面板",
            "更优秀的交互逻辑",
            "界面性能优化"
        ]
    }
}
interface DLInfo{
    versionName:string;
    versionDate:string;
    url32:string;
    url:string;
    updates:string[]
}
ReactDOM.render(<PageDLV2/>,document.querySelector("#app"))