import React from 'react'
import ReactDOMServer from 'react-dom/server'
import PageTemplate from '../../component/PageTemplate';

export default ReactDOMServer.renderToString(<PageTemplate title="商业合作">
    <div className="container">
        由于秋之盒根本拉不到商业合作<br/>
        这个页面也懒得做了,干脆删干净了<br/>
        邮箱:zsh2401@163.com
    </div>
</PageTemplate>);