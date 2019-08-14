import React from 'react'
import ReactDOM from 'react-dom'
import { StdLayout } from '../../lib/controls';
class App extends React.Component{
    render(){
        return <StdLayout>
            <h1>此页面正在维护</h1>
        </StdLayout>
    }
}
ReactDOM.render(<App/>,document.querySelector("#app"))