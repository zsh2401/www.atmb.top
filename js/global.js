function initValine(_el,pathOfPage=null){
    new Valine({
        el: _el,
        placeholder:"遵守法律法规，理性讨论，写下你对秋之盒的建议与评论",
        appId: 'VLA81Yn1kDUEgE9A99Qwnb1u-gzGzoHsz',
        appKey: 'CpivAcjiG4W9BWNpS2z47X98',
        path: pathOfPage,
      });
}