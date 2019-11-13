import React from 'react'
export default class ExtStore extends React.Component{
    render(){
        //@ts-ignore
        let id = this.props.match.params.id;
        return <div>{id}</div>
    }
}