import React from 'react'
import ReactDOM from 'react-dom'
import { StdLayout, ValineComment } from '../../lib/controls';
import {getUrlParam} from '../../lib/url-handler'
import {getHtmlByFileName,getIndexHtml} from '../../lib/data-provider/GuideProviderAjax'
import "./index.css"
import marked from 'marked'
let targetFile = getUrlParam("md") || "index.md";

class GuideReader extends React.Component{
    componentDidMount(){
        getHtmlByFileName(targetFile,(md)=>{
            document.querySelector("#md-content").innerHTML = marked(md);
        });
    }
    render(){
        return <StdLayout>
            <div id="#top"></div>
            <div className="backtotop">
                    <div className="btn-group btn-group-vertical">
                        <a href="/help"><button className="btn btn-light w-100">说明书主页</button></a>
                        <a href="#top"><button className="btn btn-light w-100">回到顶部</button></a>
                    </div>
            </div>
            <div className="container">
                <div id="md-content"></div>
                <ValineComment path={getCommentPath()}></ValineComment>
            </div>
            
        </StdLayout>
    }
}
function getCommentPath(){
    if(targetFile != "index.md"){
        return "/help/" + targetFile.substring(0,targetFile.length - 3) + ".html"
    }else{
        return "/help/"
    }
}
ReactDOM.render(<GuideReader></GuideReader>,document.querySelector("#app"))