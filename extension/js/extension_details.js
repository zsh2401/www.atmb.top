var vm = null;
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
  var pathOfPage = "/extension/" + fileName;
  initValine("#vcomments",pathOfPage);
}
$(document).ready(()=>{
  initVue();
  fetchData();
  initComments();
});