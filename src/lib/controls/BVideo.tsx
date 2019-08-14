import React from 'react';
export interface IBVideoProps{
    src:string;
}
export interface IBVideoState{
    width:string;
    height:string;
}
export class BVideo extends React.Component<IBVideoProps,IBVideoState>{
    readonly state:IBVideoState = {
        width:"0px",
        height:"0px"
    }
    componentDidMount(){
        this.resetSize();
        let that = this;
        window.addEventListener("resize",()=>{
            that.resetSize();
        });
    }
    resetSize(){
        let newVideoW =  document.getElementById("vContainer").offsetWidth * 1;
        let newVideoH = newVideoW * 0.66;
        this.setState({
            width:newVideoW + "px",
            height: newVideoH + "px"
        });
    }
    render(){
        //@ts-ignore
        return (<div id="vContainer" style={{padding:"0px"}}><iframe src={this.props.src} style={{width:this.state.width,height:this.state.height}} scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true">
            </iframe>
        </div>
        )
    }
}