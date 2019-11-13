import React from 'react'
import ReactDOMServer from 'react-dom/server'
import PageTemplate from '../../component/PageTemplate';

export default ReactDOMServer.renderToString(<PageTemplate title="404 NOT FOUND">
    <div className="container">
        <img className="img-fluid d-block mr-auto ml-auto" src="https://tse4.mm.bing.net/th?id=OIP.4l8ASeouIk7NkwOjxFDeCQHaEM&pid=Api"/>
        <div className="text-center">
            <h1 className="text-center">404 NOT FOUND  </h1>
            <h3>你来到了一个未知的领域,此页面可能已被转移了</h3>
            <a className="d-block" href="/">回到主页</a>
            <i>Get back to me when you are not here</i>
        </div>
    </div>
</PageTemplate>);