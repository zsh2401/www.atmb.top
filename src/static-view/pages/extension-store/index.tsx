import React from 'react'
import ReactDOMServer from 'react-dom/server'
import PageTemplate from '../../component/PageTemplate';
function getScript(){
    return ``
}
export default ReactDOMServer.renderToString(<PageTemplate title="拓展模块市场">
    <script type="text/javascript" dangerouslySetInnerHTML={{__html:getScript()}}></script>
    <div id="store-app" className="container"></div>
</PageTemplate>);