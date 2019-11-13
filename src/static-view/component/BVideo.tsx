import React from 'react'
export interface BVideoProps{
    source:string;
}
export default function(props:BVideoProps){
    //@ts-ignore
    return <iframe className="resizable-bvideo w-100" src={props.source} scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true">
        </iframe>
}