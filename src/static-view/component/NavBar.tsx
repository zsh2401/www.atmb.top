import React from 'react'
export default function(){
    return <nav className="navbar navbar-expand-sm navbar-light fixed-top bg-light">
        <div className="container">
            <a className="navbar-brand" href="/">AutumnBox</a> 

            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target=".targetMenu">
                <span className="navbar-toggler-icon"></span>
            </button>

            
            <div className="collapse navbar-collapse justify-content-end targetMenu">
                <ul className="navbar-nav">
                    <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" href="#" id="navbardrop" data-toggle="dropdown">
                            秋之盒
                        </a>
                        <div className="dropdown-menu">
                            <a className="dropdown-item" href="/">主页</a>
                            <a className="dropdown-item" href="/download">下载</a>
                            <a className="dropdown-item" href="/beta">BETA</a>
                        </div>
                    </li>
                    <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" href="#" id="navbardrop" data-toggle="dropdown">
                            拓展模块
                        </a>
                        <div className="dropdown-menu">
                            <a className="dropdown-item" href="/extension">拓展模块市场</a>
                            <a className="dropdown-item" href="https://github.com/zsh2401/AutumnBox">拓展模块开放文档</a>
                        </div>
                    </li>
                    <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" href="#" id="navbardrop" data-toggle="dropdown">
                            开源/捐赠
                        </a>
                        <div className="dropdown-menu">
                            <a className="dropdown-item" href="/donate">捐赠与支持</a>
                            <a className="dropdown-item" href="/opensource">开源与鸣谢</a>
                        </div>
                    </li>
                    {/* <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" href="#" id="navbardrop" data-toggle="dropdown">
                            帮助
                        </a>
                        <div className="dropdown-menu">
                            <a className="dropdown-item" href="/help">说明书</a>
                        </div>
                    </li> */}
                    <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" href="#" id="navbardrop" data-toggle="dropdown">
                            关于
                        </a>
                        <div className="dropdown-menu">
                            <a className="dropdown-item" href="/about">联系</a>
                            <a className="dropdown-item" href="/story">故事</a>
                            <a className="dropdown-item" href="https://zsh2401.top">博客</a>
                            <a className="dropdown-item" href="/com">商务合作</a>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
      </nav>
}