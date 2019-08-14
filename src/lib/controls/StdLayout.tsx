import React, { CSSProperties } from 'react'
import { NavBar } from './NavBar';
import { Footer } from './Footer';
export class StdLayout extends React.Component{
    private readonly outerStyle:CSSProperties = {
        display:"flex",
        flexDirection:"column",
        height:"100%",
        width:"100%"
    }
    private readonly navBarContainerStyle:CSSProperties = {
        position:"fixed",
        top:"0px",
        left:"0px",
        height:"50px",
        width:"100%"
    }
    private readonly mainContainerStyle:CSSProperties = {
        marginTop:"50px",
        flex:"1 0 auto"
    }
    private readonly footerWrapperStyle:CSSProperties = {
        flex:"0 0 auto"
    }
    render(){
        return <div style={this.outerStyle}>
            <NavBar></NavBar>
            <div style={this.mainContainerStyle}>
                {this.props.children}
            </div>
            <div style={this.footerWrapperStyle}>
                <Footer></Footer>
            </div>
        </div>
    }
}