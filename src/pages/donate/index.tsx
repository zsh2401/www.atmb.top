import React from 'react'
import ReactDOM from 'react-dom'
import { StdLayout } from '../../lib/controls';
import "./index.css"
import * as dm from '../../lib/data-provider/DonorsInfoProvider'
class PageDonate extends React.Component{
    render(){
        let views = [];
        dm.getDonors().forEach(d=>{
            views.push(<DonateRecord data={d}></DonateRecord>)
        })
        return <StdLayout>
            <div className="container">
                <br/>
                <div className="row">
                    <div className="col-sm-8 text-center">
                        <h3>秋之盒需要您的帮助</h3>
                        <p>
                            秋之盒是一个完全开源免费的自由软件,兴趣是我开发这个软件的最初动力<br/>
                            <br/>
                            许多人使用并称赞了秋之盒,说真的,我很开心(^▽^)<br/>
                            <br/>
                            但......一个项目纯粹靠兴趣来维持,真能活得长久吗?<br/>
                            <br/>
                            无数的软件因为难以盈利而倒下或成为流氓被人唾弃<br/>
                            <br/>
                            我希望大家能够一起守护秋之盒的纯洁与美好....
                        </p>
                    </div>


                    <div className="col-sm-4">
                        <div className="d-flex justify-content-center">
                            <img style={{width:"200px"}} className="img-fluid" src={require("./pot4winter.png")}/>
                        </div>
                        <p className="text-center">开发者的小猫娘画的冬之盆</p>
                    </div>
                </div>
                <h3 className="text-center">捐赠方式<small><br/>你的捐赠将被永久记录</small> </h3>
                <div className="row">
                    <img src={require("./alishop.png")} className="img-fluid col-md-4 donate-img"/>
                    <img src={require("./redpacket.jpg")} className="img-fluid col-md-4 donate-img"/>
                    <img src={require("./wechatpay.jpg")} className="img-fluid col-md-4 donate-img"/>
                </div>
                <br/>
                <h3 className="text-center">捐赠名单</h3>
                <p className="text-center">如果您没有被记录,请联系zsh2401@163.com</p>
                
                <h5 className="text-center">{dm.getTotalTimes()}份捐赠,共计{dm.getTotalAmountAsString()}元</h5>
                <h5 className="text-center">谢谢你们</h5>
                
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>名</th>
                            <th>日期</th>
                            <th>金额</th>
                            <th>备注</th>
                        </tr>
                    </thead>
                    <tbody>
                        {views}
                    </tbody>
                </table>
            </div>
        </StdLayout>
    }
}
interface IDonateRecordProps{
    data:dm.IDonor;
}
class DonateRecord extends React.Component<IDonateRecordProps>{
    render(){
        return <tr>
            <th>{this.props.data.name || "佚名"}</th>
            <th>{this.props.data.date || "不详"}</th>
            <th>¥{this.props.data.amount}</th>
            <th>{this.props.data.t || "无"}</th>
        </tr>
    }
}
ReactDOM.render(<PageDonate></PageDonate>,document.querySelector("#app"));