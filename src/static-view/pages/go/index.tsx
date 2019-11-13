import React from 'react'
import ReactDOMServer from 'react-dom/server'
import PageTemplate from '../../component/PageTemplate';

export default ReactDOMServer.renderToString(<PageTemplate title="GO">
    <div id="app"></div>
</PageTemplate>);