var vm = null;
function getUrlParam(name){
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg);  //匹配目标参数
  if (r != null) return unescape(r[2]); return null; //返回参数值
}
function initVue(){
  vm = new Vue({
    el:"#information",
    data:{
      ext:null,
      descMarkDown:null,
      downloadCount:null,
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
    console.log(vm.$data.ext.descMarkDown);
    queryDownloadCount(json.id,function(count){
      vm.$data.downloadCount = count;
    });
  })
}
function initComments(){
  new Valine({
      el: '#vcomments',
      placeholder:"遵守法律法规，理性讨论，写下你的建议与评论",
      appId: 'VLA81Yn1kDUEgE9A99Qwnb1u-gzGzoHsz',
      appKey: 'CpivAcjiG4W9BWNpS2z47X98'
  });
}