var vm = null;
function initVue(){
  vm = new Vue({
    el:"#information",
    data:{
      ext:null,
      descMarkDown:null,
      downloadCount:"N/A",
    },
    methods:{
      onClickDownload:function(){
        window.location = this.ext.downloadUrl;
        addDownloadCount(this.ext.id);
      }
    }
  });
}
function fetchData(){
  var fileName = getUrlParam("j");
  fetch(fileName)
  .then(res=>res.text())
  .then(text=>{
    var json = eval("(" + text + ")");
    vm.$data.ext = json;
    document.title = json.name +"-秋之盒拓展";
    var parser = new HyperDown(); 
    var html = parser.makeHtml(json.desc);
    vm.$data.ext.descMarkDown = html;
    queryDownloadCount(json.id,function(count){
      vm.$data.downloadCount = count;
    });
  })
}
function initComments(){
  var fileName = getUrlParam("j");
  var pathOfPage = "/extension/" + fileName;
  new Valine({
    el: "#vcomments",
    placeholder:"遵守法律法规，理性讨论，写下你对该模块的建议与评论,建议留下邮箱方便进行回复",
    appId: 'VLA81Yn1kDUEgE9A99Qwnb1u-gzGzoHsz',
    appKey: 'CpivAcjiG4W9BWNpS2z47X98',
    path: pathOfPage,
  });
}
$(document).ready(()=>{
  initVue();
  fetchData();
  initComments();
});