import React, { ReactNode } from 'react'
import ReactDOM from 'react-dom'
import {StdLayout} from '../../lib/controls'
import "./beta.css"
class PageBeta extends React.Component{
    render():ReactNode{
        let info = getVInfo();
        return <StdLayout>
            <div className="header text-center text-white">
                <h1>AUTUMNBOX BETA</h1>
                <h4>参与测试,体验最新版本秋之盒,反馈问题</h4>
            </div>
            <div className="container">
                <div className="text-center">
                    <br/>
                    <h3>{info.versionName}</h3>
                    <h5 dangerouslySetInnerHTML={{__html:info.description}}></h5>
                    <hr/>
                    <a href={info.downloadUrl}>
                        <button className="btn btn-warning text-white">下载最新BETA版(仅64位)</button>
                    </a>
                    <br/>  <br/>
                    <p>测试版可能存在不可预知的风险,请悉知</p>
                </div>
            </div>
        </StdLayout>
    }
}
function getVInfo():BetaVersionInfo{
    return {
        versionName:"2019.9-BETA-1",
        downloadUrl:"/releases/AutumnBox-2019.9-BETA-2-x64.zip",
        description:"0.界面大改<br>1.多处BUG修复<br/>2.更新SDK"
    }
}
interface BetaVersionInfo{
    versionName:string;
    downloadUrl:string;
    description:string;
}
ReactDOM.render(<PageBeta></PageBeta>,document.querySelector("#app"));