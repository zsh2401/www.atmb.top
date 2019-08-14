import React from 'react'
import ReactDOM from 'react-dom'
import { StdLayout } from '../../lib/controls';
import stories from "./story.json";
class PageStory extends React.Component{
    render(){
        let lines = [];
        (stories as Array<Story>).forEach(s=>{
            lines.push(<Line story={s}/>)
        })
        return <StdLayout>
            <div className="container">
                <br/><br/>
                <h1 className="text-center" style={{color:"orange"}}>The Story of AutumnBox</h1>
                <br/><br/>
                {lines}
            </div>
        </StdLayout>
    }
}
interface LineProps{
    story:Story;
}
class Line extends React.Component<LineProps>{
    render(){
        return <div className="row" style={{marginBottom:"20px"}}>
            <div className="col-3">
                <span style={{background:"orange",width:"20px"}}>&nbsp;&nbsp;&nbsp;</span>
                <span> {this.props.story.date}</span>
            </div>
            <div className="col-9">
            <span dangerouslySetInnerHTML={{__html:"    " + this.props.story.story}}></span>
            </div>
        </div>
    }
}
interface Story{
    date:string;
    story:string;
}
ReactDOM.render(<PageStory/>,document.querySelector("#app"))