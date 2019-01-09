var vm = null;
function initVue(){
  vm = new Vue({
    el:"#information",
    data:{
      ext:null,
      extpics:[],
      downloadCount:"N/A",
    },
    methods:{
      onClickDownload:function(){
        window.location = this.ext.downloadUrl;
        addDownloadCount(this.ext.id,this.ext.name);
      }
    },
    mounted(){
      fetchData();
      setTimeout(function(){
        initSwiper();
        initComments();
     },200);
    }
  });
}
function fetchData(){
  var fileName = getUrlParam("j");
  fetch(fileName)
  .then(res=>res.json())
  .then(json=>{
    console.log(json);
    vm.$data.ext = json;
    if(json.pics != null && json.pics.length != 0){
      vm.$data.extpics = json.pics;
    }
    document.title = json.name +"-秋之盒拓展";
    queryDownloadCount(json.id,function(count){
      vm.$data.downloadCount = count[json.id];
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
function initSwiper(){
  new Swiper('.swiper-container', {
    slidesPerView: 2.1,
    spaceBetween: 40,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
  });
}
$(document).ready(()=>{
  initVue();
});