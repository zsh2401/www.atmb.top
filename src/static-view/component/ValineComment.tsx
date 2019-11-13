import React from 'react'

export interface ValineCommentProps{
    path?:string;
}
export default function(props:ValineCommentProps){
    return <div>
        <div id="vcomment"></div>
        <script dangerouslySetInnerHTML={{__html:getScript(props)}}></script>
    </div>
}
function getScript(props:ValineCommentProps):string{
    return `
new Valine({
    av: AV, 
    el: "#vcomment",
    app_id: "VLA81Yn1kDUEgE9A99Qwnb1u-gzGzoHsz",
    app_key: "CpivAcjiG4W9BWNpS2z47X98",
    path:${props.path || undefined},
    placeholder: '遵守法律法规，理性讨论,建议留下邮箱,否则你无法收到回复通知'
});
`
}