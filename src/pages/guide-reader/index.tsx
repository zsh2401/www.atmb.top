import React from 'react'
import ReactDOM from 'react-dom'
import { StdLayout } from '../../lib/controls';
import {getUrlParam} from '../../lib/url-handler'
import {GuideProviderAjax} from '../../lib/data-provider/GuideProviderAjax'
let targetFile = getUrlParam("md") || "index.md";
new GuideProviderAjax().getHtmlByFileName(targetFile,(md)=>{
    console.log(md);
});
class GuideReader extends React.Component{
    render(){
        return <StdLayout>
            <h1>此页面正在维护</h1>
        </StdLayout>
    }
}
ReactDOM.render(<GuideReader></GuideReader>,document.querySelector("#app"))