var vm = null
var __STORIES_URL = "/_data_/timeline.json";
function initVue(){
    vm = new Vue({
        el:"#story",
        data:{timeline:[]},
        mounted(){
            fetch(__STORIES_URL)
            .then(response=>response.json())
            .then(json=>{
                console.log(json);
                this.$data.timeline = json;
            }).catch((e)=>{
                console.log(e);
            })
        }
    });
}
$(document).ready(()=>{
    initVue();
});