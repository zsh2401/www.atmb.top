import React from 'react'
import ReactDOM from 'react-dom'
import { StdLayout } from '../../lib/controls';
class PageCom extends React.Component{
    render(){
        return <StdLayout>
            <div className="container">
                由于秋之盒根本拉不到商业合作<br/>
                这个页面也懒得做了,干脆删干净了<br/>
                邮箱:zsh2401@163.com
            </div>
        </StdLayout>
    }
}
ReactDOM.render(<PageCom></PageCom>,document.querySelector("#app"))