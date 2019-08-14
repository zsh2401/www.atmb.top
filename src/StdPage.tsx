import React from 'react';
import ReactDOM from 'react-dom/server'
export interface StdPageProps{
    title:string;
    desc:string;
    ext_data:string;
}
export class StdPage extends React.Component<StdPageProps>{
    render(){
        return <html lang="zh">
        <head>
        <meta charSet="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
        <title>{this.props.title}</title>
        <meta name="description" content={this.props.desc}/>
        
        {/* lib */}
        <script src="https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js"></script>

        {/* <!-- React --> */}
        <script src="https://cdn.bootcss.com/react/16.9.0-rc.0/umd/react.production.min.js"></script>
        <script src="https://cdn.bootcss.com/react-dom/16.9.0-alpha.0/umd/react-dom.production.min.js"></script>

        {/* <!-- BS --> */}
        <link href="https://cdn.bootcss.com/twitter-bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet"/>
        <script src="https://cdn.bootcss.com/twitter-bootstrap/4.3.1/js/bootstrap.min.js"></script>

        {/* <!-- Valine --> */}
        <script src="https://cdn.jsdelivr.net/npm/leancloud-storage@3.11.1/dist/av-min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/valine@1.3.4/dist/Valine.min.js"></script>
        
        <script dangerouslySetInnerHTML={{__html:"const __EXT_DATA__ = " + JSON.stringify(this.props.ext_data)}}></script>
        </head>
        <body>
            {this.props.children}
        </body>
    </html>
    }
}
export default function(props){
    return ReactDOM.renderToString(<StdPage 
        title={props.htmlWebpackPlugin.options.title} 
        desc={props.htmlWebpackPlugin.options.desc || props.htmlWebpackPlugin.options.title} 
        ext_data={props.htmlWebpackPlugin.options.ext_data || props.ext_data  || {a:"b"}}>
            <div id="app">
                您的设备不支持浏览秋之盒站点
            </div>
        </StdPage>);
}
