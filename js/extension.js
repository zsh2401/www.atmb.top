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
  var fileName = getUrlParam("j");
  var pathOfPage = "./" + j;
  initValine("#vcomments","");
}