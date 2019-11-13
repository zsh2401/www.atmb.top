import React from 'react'
import NavBar from './NavBar'
import Footer from './Footer';
export interface PageTemplateProps{
    title:string;
    description?:string;
    children: React.ReactNode;
}
export default function(props:PageTemplateProps){
    return <html lang="zh">
    <head>
    <meta charSet="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
    <meta name="description" content={props.description || "秋之盒是一款开源,易用,免费的安卓工具箱,在本站点您将可以下载,讨论与浏览帮助文档"}/>
    <title>{props.title + "-秋之盒"}</title>
    
    {/* lib */}
    <script src="https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js"></script>

    {/* <!-- BS --> */}
    <script src="https://cdn.bootcss.com/twitter-bootstrap/4.3.1/js/bootstrap.min.js"></script>
    <link href="https://cdn.bootcss.com/twitter-bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet"/>
   

    {/* <!-- Valine --> */}
    <script src="https://cdn.jsdelivr.net/npm/leancloud-storage@3.11.1/dist/av-min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/valine@1.3.4/dist/Valine.min.js"></script>
    </head>
    <body>
        <div className="w-100 h-100 d-flex flex-column">
            <NavBar/>
            <div className="flex-grow-1" style={{marginTop:"50px"}}>
                {props.children}
            </div>
            <div className="flex-grow-0">
                <Footer/>
            </div>
        </div>
    </body>
</html>
}