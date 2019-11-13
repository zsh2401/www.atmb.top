import React from 'react'
import ReactDOM from 'react-dom/server'
import PageTemplate from '../../component/PageTemplate';
import stories from './story.json'
export default ReactDOM.renderToString(<Page/>);

function Page(){
    return <PageTemplate title="故事">
            <div className="container">
                <br/><br/>
                <h1 className="text-center" style={{color:"orange"}}>The Story of AutumnBox</h1>
                <br/><br/>
                {stories.map(story=><Line {...story}/>)}
            </div>
    </PageTemplate>
}
function Line(props:any){
    return <div className="row" style={{marginBottom:"20px"}}>
    <div className="col-3">
        <span style={{background:"orange",width:"20px"}}>&nbsp;&nbsp;&nbsp;</span>
        <span> {props.date}</span>
    </div>
    <div className="col-9">
    <span dangerouslySetInnerHTML={{__html:"    " + props.story}}></span>
    </div>
</div>
}