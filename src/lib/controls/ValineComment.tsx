import React from 'react';
import Valine from 'valine';
import AV from 'leancloud-storage'
export interface IVCommentProps{
    path?:string | undefined;
}
export  class ValineComment extends React.Component<IVCommentProps>{
    componentDidMount(){
        new Valine({
                av: AV, 
                el: "#vcomment",
                app_id: "VLA81Yn1kDUEgE9A99Qwnb1u-gzGzoHsz",
                app_key: "CpivAcjiG4W9BWNpS2z47X98",
                path:this.props.path,
                placeholder: '遵守法律法规，理性讨论,建议留下邮箱,否则你无法收到回复通知'
        });
    }
    render(){
        return (<div id="vcomment"></div>)
    }
}