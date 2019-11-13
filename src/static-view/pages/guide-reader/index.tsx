import React from 'react'
import ReactDOMServer from 'react-dom/server'
import PageTemplate from '../../component/PageTemplate';

export default ReactDOMServer.renderToString(<PageTemplate title="开放源代码">
    <div className="container">
        <div className="alert alert-warning">此页面正在维护</div>
    </div>
</PageTemplate>);