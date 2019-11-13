import React from 'react'
interface ListOfThanksProps{
    names:Array<string>;
    title:string;
}
export default class ListOfThanks extends React.Component<ListOfThanksProps>{
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