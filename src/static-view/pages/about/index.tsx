import React from 'react'
import ReactDOM from 'react-dom/server'
import PageTemplate from '../../component/PageTemplate';
import BVideo from '../../component/BVideo';
export default ReactDOM.renderToString(<Page/>)
function Page(){
    return <PageTemplate title="关于秋之盒">
     <div className="container">
    <div className="row">
    <div className="col-md-6 col-sm-6" style={{marginBottom:20}}>
        <h2 className="margin-top:0">联系开发者<small>zsh2401@163.com</small> </h2>
        <div className="btn-group">
            <button type="button" className="btn btn-light" onClick={()=>this.openUrl('https://www.zsh2401.top/')}>
                个人网站
            </button>
            <button type="button" className="btn btn-light" onClick={()=>{this.openUrl("https://space.bilibili.com/3061574/#/")}}>
                哔哩哔哩
            </button>
            <button type="button" className="btn btn-light" onClick={()=>this.openUrl('https://www.coolapk.com/dyh/1592')}>
                酷安看看号
        </button>
        </div>
    </div>
    <div className="col-md-6 col-sm-6">
        <h2 style={{marginTop:0}}> 用户/开发者交流/内测</h2>
        <button type="button" className="btn btn-light" onClick={()=>{window.open('http://shang.qq.com/wpa/qunwpa?idkey=6210b7c1027584a9fc497d1dc59649dbc7d2da9739145cdbba71b5b6d4616e8f')}}>
            加入群(246177486)
        </button>
    </div>
    </div>
    <br/><br/>
    <BVideo source="//player.bilibili.com/player.html?aid=41336181&amp;cid=72599777&amp;page=1"/>
</div>
</PageTemplate>
}