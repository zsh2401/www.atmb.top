import React from 'react'
import ReactDOM from 'react-dom/server'
import PageTemplate from '../../component/PageTemplate'
import updateInfo from '../../../data/update.json'

//@ts-ignore
import style from '../../../common/text-loader!./index.css'
import ValineComment from '../../component/ValineComment';

export default function(){
    return ReactDOM.renderToString(<Page/>);
}
function Page(){
    return <PageTemplate title="主页">
        <style dangerouslySetInnerHTML={{__html:style}}/>
        <div className="header">
                <div className="container jumbotron" style={{background:"transparent"}}>
                    <h1 className="text-white">AutumnBox 2019.4</h1>
                    <h5 className="text-white">开源,易用,免费的安卓手机助手</h5>
                    <div className="btn-group">
                        <a href="/download"><button type="button" className="btn btn-success no-radius">立刻下载</button></a>
                        <a href="/opensource"><button type="button" className="btn btn-light no-radius">浏览源代码</button></a>
                    </div>
                    <p className="text-white">交流群:246177486</p>
                </div>
            </div>

            <div className="container">

                <div className="row">
                    <div className="col-md-3 col-sm-6 col-6">
                        <a href="/about" className="hlink">
                            <h5>激活软件</h5>
                            <li><a target="_blank" href="https://www.coolapk.com/apk/com.catchingnow.icebox">冰箱</a></li>
                            <li><a target="_blank" href="https://www.coolapk.com/apk/web1n.stopapp">小黑屋@web1n</a></li>    
                            <li><a target="_blank" href="https://www.coolapk.com/apk/com.hld.apurikakusu">黑洞</a></li>     
                            <li><a target="_blank" href="https://www.coolapk.com/apk/me.yourbay.airfrozen">空调狗</a></li>
                            <li><a target="_blank" href="https://www.coolapk.com/apk/com.hld.anzenbokusu">第二空间</a></li>
                            <li><a target="_blank" href="https://www.coolapk.com/apk/cf.playhi.freezeyou">Freeze You!</a></li>
                            <li><a target="_blank" href="http://kfmark.com/">快否</a></li>   
                        </a>
                    </div>
                    <div className="col-md-3 col-sm-6 col-6">
                        <a href="/about" className="hlink">
                            <h5>执行脚本</h5>
                            <li><a target="_blank" href="https://www.coolapk.com/apk/me.piebridge.brevent">黑域</a></li>
                            <li><a target="_blank" href="https://www.coolapk.com/apk/moe.shizuku.privileged.api">ShizukuManager</a></li>    
                        </a>
                    </div>
                    <div className="col-md-3 col-sm-6 col-6">
                        <a href="/about" className="hlink">
                            <h5>手机刷机</h5>
                            <li>刷入Recovery</li>
                            <li>解锁System分区</li>
                            <li>一键上BL锁</li>    
                        </a>
                    </div>
                    <div className="col-md-3 col-sm-12 col-6">
                        <h5>界面美观</h5>
                        <p>WPF+HandyControl</p>
                    </div>
                </div>

                <br/>
                <div className="row">
                    <div className="col-md-6 col-sm-6">
                        <h3>
                            <embed className="embed-icon" src={require("../../../assets/svg/security.svg")}></embed>
                            秋之盒值得被您信任
                        </h3>
                        <li>使用C#和WPF技术编写,遵守Windows API规范</li>
                        <li>
                            <a href="/os">
                                <img src="https://img.shields.io/badge/%E5%BC%80%E6%BA%90%E8%AE%B8%E5%8F%AF-LGPL3.0-brightgreen.svg"></img>
                            </a>
                        </li>
                        <li>
                            <a target="_blank" href="http://r.virscan.org/language/zh-cn/report/67dda3a561124fe6c0818cfe32da9f9f">
                                <img src="https://img.shields.io/badge/%E5%85%A8%E7%90%83%E6%9F%A5%E6%9D%80-安全-brightgreen.svg"></img>
                            </a>
                        </li>
                        <li>
                            <a target="_blank" href="https://habo.qq.com/file/showdetail?pk=ADQGb11vB2QIOls5U2A%3D">
                                <img src="https://img.shields.io/badge/%E8%85%BE%E8%AE%AF%E5%93%88%E5%8B%83-%E6%9C%AA%E5%8F%91%E7%8E%B0%E9%A3%8E%E9%99%A9-brightgreen.svg"></img>
                            </a>
                        </li>
                    </div>

                    <div className="col-md-6 col-sm-6">
                        <h3>
                            <embed className="embed-icon" src={require("../../../assets/svg/req.svg")}></embed>
                            运行所需
                        </h3>
                        <li>
                            <embed className="embed-icon" src={require("../../../assets/svg/pc.svg")}></embed>
                            <span>X86桌面设备(常见的个人计算机)</span>
                        </li>
                        <li>
                            <embed className="embed-icon" src={require("../../../assets/svg/windows.svg")}></embed>
                            <span>建议Win10(1809) 最低Win7</span>
                        </li>
                        <li>
                            <embed className="embed-icon" src={require("../../../assets/svg/env.svg")}></embed>
                            <span>.net 4.6及以上(Win10自带)</span>
                            <a target="_blank" href="/go/download/dotnet/"> [点击下载]</a>
                        </li>
                    </div>
                </div>
                <br/>
                <div className="row">
               
                    <div className="col-md-6 col-sm-6">
                        <h3>
                            <embed className="embed-icon" src={require("../../../assets/svg/leaf.svg")}></embed>
                            {updateInfo.version}-更新日志
                            <p>{updateInfo.message}</p>
                        </h3>
                        
                    </div>

                    <div className="col-md-6 col-sm-6">
                        <h3>
                            <embed className="embed-icon" src={require("../../../assets/svg/heart.svg")}></embed>
                            开发者需要您的帮助
                        </h3>
                        <p>我只是一名19岁学生,最初为学习与实践目的创立了此项目.</p>
                        <p>如今面临巨大的生活与学习压力,我不得不放缓开发进度.</p>
                        <p>我希望您可以支持我,这完全是自愿的.</p>
                    </div>
                </div>
                <br/>
                <h3 className="text-center">想说点什么吗?</h3>
                <ValineComment/>
        </div>
    </PageTemplate>
}