import React from 'react'
import ReactDOM from 'react-dom/server'
import updateInfo from '../../../data/update.json'
import PageTemplate from '../../component/PageTemplate';
//@ts-ignore
import style from '../../../common/text-loader!./index.css'
export default ReactDOM.renderToString(<Page/>);
function Page(){
    return  <PageTemplate title="下载">
        <style dangerouslySetInnerHTML={{__html:style}}></style>
    <div className="container">
    <br/><br/>
    <div className="text-center">
        <div className="alert alert-success">
            感谢下载秋之盒,接下来,您可以查阅
            <a href="/help">秋之盒说明书</a>
        </div>
        <div className="alert alert-warning">
            想尝鲜?请参与
            <a href="/beta">秋之盒BETA测试</a>
        </div>
        <a href="/donate" >扫码捐赠或领取最大99元支付宝赏金红包</a>
        <br/>
        <h3>{updateInfo.version}更新日志</h3>
        <p>{updateInfo.message}</p>
    </div>
    <br/>
    <h1 className="text-center">选择下载途径</h1>
    <br/>
    <div className="row">
        {getDownloadWays().map(way=><DownloadWay {...way}/> )}
    </div>
</div>
</PageTemplate>
}
function getDownloadWays():Array<IDownloadWay>{
    return [
        {name:"MonoLogueChi",downloadUrl:"https://atmb.sm9.top/AutumnBox/%E4%B8%BB%E7%A8%8B%E5%BA%8F/",
        descriptionHTML:"MonoLogueChi提供<br>通常在10分钟内跟进最新版<br>",
        iconSrc:require("./mono.jpg"), 
        aboutTitle:"叉叉白博客",
        aboutUrl:"https://www.xxwhite.com/"},

        {name:"百度网盘",downloadUrl:"https://pan.baidu.com/s/1bFZBAI",
        descriptionHTML:"秋之盒开发者提供<br>更新速度快,下载慢",
        iconSrc:require("./misaka2.png"), 
        aboutTitle:"2401的晚秋咖啡",
        aboutUrl:"https://zsh2401.top"},
    ];
}
interface IDownloadWay{
    name:string;
    iconSrc:string;
    downloadUrl:string;
    descriptionHTML:string;
    aboutUrl:string;
    aboutTitle:string;
}
function DownloadWay(props:IDownloadWay){
    return <div className="col-md-6 col-sm-6 text-center">
    <img className="img-responsive header-icon" src={props.iconSrc}></img>
    <h3>{props.name}</h3>
    <a href={props.downloadUrl}><button type="button" className="btn btn-success">下载</button></a>
    <div>
        <p dangerouslySetInnerHTML={{__html:props.descriptionHTML}}></p>
        <a href={props.aboutUrl}>{props.aboutTitle}</a> 
    </div>
</div>
}