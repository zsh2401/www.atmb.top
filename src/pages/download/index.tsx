import React from 'react'
import ReactDOM from 'react-dom'
import { StdLayout } from '../../lib/controls/StdLayout';
import * as updateGetter from '../../lib/data-provider/UpdateInfoGetter'
import "./index.css"
interface PageDLState{
    versionInfo:updateGetter.VersionInfo;
}
class PageDL extends React.Component<any,PageDLState>{
    state:PageDLState = {
        versionInfo:{
            version:"NULL",
            message:"NULL",
            header:"NULL",
            updateUrl:"NULL",
            directlyUrl:"NULL",
            date:[1970,1,1]
        }
    }
    constructor(props:any){
        super(props);
        let that = this;
        updateGetter.getUpdateInfo((versionInfo)=>{
            that.setState({versionInfo:versionInfo})
        });
    }
    render(){
        return <StdLayout>
            <div className="container">
                <br/><br/>
                <div className="text-center">
                    <div className="alert alert-success">
                        感谢下载秋之盒,接下来,您可以查阅
                        <a href="/help">秋之盒说明书</a>
                    </div>
                    <a href="/donate" >扫码捐赠或领取最大99元支付宝赏金红包</a>
                    <br/>
                    <h3>{this.state.versionInfo.version}更新日志</h3>
                    <p>{this.state.versionInfo.message}</p>
                </div>
                <br/>
                <h1 className="text-center">选择下载途径</h1>
                <br/>
                <div className="row">
                    {/* 这里不用循环的原因是图片的require问题,所以直接编译时声明 */}
                    <div className="col-md-3 col-sm-6 text-center">
                        <img className="img-responsive header-icon" src={require("./mono.jpg")}></img>
                        <h3>MonoLogueChi</h3>
                        <button type="button" className="btn btn-success" onClick={()=>window.location.href="https://atmb.sm9.top/AutumnBox/%E4%B8%BB%E7%A8%8B%E5%BA%8F/"}>下载</button>
                        <div>
                            MonoLogueChi提供<br/>通常在10分钟内跟进最新版<br/>
                            <a href="https://www.xxwhite.com/">叉叉白博客</a> 
                        </div>
                        <p></p>
                    </div>



                    <div className="col-md-3 col-sm-6 text-center">
                        <img className="img-responsive header-icon" src={require("./web1n.jpg")}></img>
                        <h3>web1n</h3>
                        <button type="button" className="btn btn-success" onClick={()=>window.location.href="https://download.udp.pw/?dir=安卓/工具/秋之盒"}>下载</button>
                        <div>
                            小黑屋开发者web1n提供<br/>通常在1天内跟进最新版<br/>
                            <a href="https://https.vc/">web1n博客</a> 
                        </div>
                        <p></p>
                    </div>




                    <div className="col-md-3 col-sm-6 text-center">
                        <img className="img-responsive header-icon" src={require("./sgd.bmp")}></img>
                        <h3>SGD</h3>
                        <button type="button" className="btn btn-success" onClick={()=>window.location.href="http://swssoftwareshare.gitee.io/autumnbox/"}>下载</button>
                        <div>
                        通常在一周内更新<br/>有美国和中国两国服务器，下载速度快。<br/>
                        </div>
                        <p></p>
                    </div>



                    <div className="col-md-3 col-sm-6 text-center">
                        <img className="img-responsive header-icon"  src={require("./misaka2.png")}></img>
                        <h3>百度网盘</h3>
                        <button type="button" className="btn btn-warning" onClick={()=>window.location.href="https://pan.baidu.com/s/1bFZBAI"}>下载</button>
                        <div>
                            秋之盒开发者提供<br/>更新速度快,下载慢<br/>
                            <a href="https://zsh2401.top">2401的晚秋咖啡</a> 
                        </div>
                        <p></p>
                    </div>


                </div>
            </div>
        </StdLayout>
    }
}
ReactDOM.render(<PageDL></PageDL>,document.querySelector("#app"));
