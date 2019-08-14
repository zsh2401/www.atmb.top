import React from 'react'
import ReactDOM from 'react-dom'
import {StdLayout} from "../../lib/controls/StdLayout"
class Page404 extends React.Component{
    render(){
        return <StdLayout>
            <div className="container">
            <div className="row" style={{marginTop:20}}>
                <div className="col-md-6 col-sm-6">
                    <p style={{fontSize:"70px"}}>404<br/>NOT FOUND</p>
                </div>

                <div className="col-md-6 col-sm-6">
                    <img className="img-responsive" src="https://tse4.mm.bing.net/th?id=OIP.4l8ASeouIk7NkwOjxFDeCQHaEM&pid=Api"/>
                </div>
            </div>
            <h3>你来到了一个未知的领域,此页面可能已被转移了</h3>
            <a href="/"><h3>前往本站主页</h3></a>
        </div>
        </StdLayout>
    }
}
ReactDOM.render(<Page404></Page404>,document.querySelector("#app"));