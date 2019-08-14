import React from 'react'
import ReactDOM from 'react-dom'
import { StdLayout } from '../../lib/controls';
class PageOS extends React.Component{
    render(){
        return <StdLayout>
            <div className="container">
                <br/>
                <div className="d-flex justify-content-center">
                    <img className="w-25" src={require("./github.png")}/>    
                </div>
                <div className="text-center">
                    <h1>开源</h1>
                    <p>秋之盒现以LGPL3.0 (宽松的GNU公共协议)开源,请在必要时遵守开源协议<br/>
    如果可以的话,希望能够标个星,这是对我开源代码的认可</p>
                    <div className="btn btn-group">
                        <a href="https://github.com/zsh2401/AutumnBox"><button className="btn btn-light">秋之盒仓库</button></a>
                        <a href="https://github.com/zsh2401/www.atmb.top"><button className="btn btn-light">秋之盒官网仓库</button></a>
                    </div>
                </div>
               
                <div className="row">

                    <ListOfThanks title="秋之盒的构建离不开以下组织与项目" names={[
                        "Newtonsoft.Json",
                        "Google",
                        "Android",
                        "Linux",
                        "C#",
                        "Microsoft",
                        "MaterialDesignInXaml",
                        "bilibili弹幕姬",
                    ]}/>

                    <ListOfThanks title="秋之盒站点的构建离不开以下组织与项目" names={[
                        "React.js",
                        "Bootstrap 4",
                        "Webpack",
                        "TypeScript",
                        "Coding Page"
                    ]}/>

                    <ListOfThanks title="秋之盒站点的构建离不开以下开发者" names={[
                        "@MonoLogueChi 秋之盒合作开发",
                        "@web1n 小黑屋/黑科技",
                        "@咖枯 黑洞/第二空间",
                        "@Playhi FreezeYou!",
                    ]}/>
                </div>
            </div>
        </StdLayout>
    }
}
interface ListOfThanksProps{
    names:Array<string>;
    title:string;
}
class ListOfThanks extends React.Component<ListOfThanksProps>{
    render(){
        let nameViews = [];
        this.props.names.forEach(name=>{
            nameViews.push(<div>{name}</div>)
        })
        return< div className="col-sm-4 border border-light">
        {this.props.title}
        <Line></Line>
        {nameViews}
    </div>
    }
}
class Line extends React.Component{
    render(){
        return <div style={{width:"100%",height:"1px",background:"gray"}}></div>
    }
}
ReactDOM.render(<PageOS></PageOS>,document.querySelector("#app"))