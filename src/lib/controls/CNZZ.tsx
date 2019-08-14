import React from 'react';
export class CNZZ extends React.Component{
    componentDidMount(){
        let cnzzC = document.querySelector("#fuck") as Element;
        let eleScript = document.createElement('script');
        eleScript.src = "//s23.cnzz.com/z_stat.php?id=1272395513&show=pic";
        eleScript.type = "text/javascript";
        cnzzC.appendChild(eleScript);
    }
    render(){
        return (
        <div id="fuck">
            <span id='cnzz_stat_icon_1272395513'></span>
        </div>)
    }
}