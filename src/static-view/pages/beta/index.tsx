import React from 'react'
import ReactDOMServer from 'react-dom/server'
import PageTemplate from '../../component/PageTemplate';
//@ts-ignore
import style from "../../../common/text-loader!./beta.css"
const info = {
    versionName:"2019.9-BETA-1",
    downloadUrl:"https://dream.zsh2401.top:4396/beta/",
    description:"0.界面大改<br>1.多处BUG修复<br/>2.更新SDK"
}
export default ReactDOMServer.renderToString(<PageTemplate title="BETA">
    <style dangerouslySetInnerHTML={{__html:style}}></style>
    <div className="beta-header text-center text-white">
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
</PageTemplate>);

