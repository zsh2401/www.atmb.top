var vm = null;
function initVue() {
    vm = new Vue({
        el: "#donationsDiv",
        data: { donations: null }
    });
}
function fetchData() {
    fetch("donations.json")
        .then(response => response.json())
        .then(json => {
            vm.$data.donations = sortDonations(json);
        })
        .catch(err => {
            console.log(err);
        });
}
function sortDonations(arr) {
    var d = new Date();
    return arr.sort(function (a, b) {
        if (a.count === b.count) {
            var c0 = a.date.split('/');
            var c1 = b.date.split('/');
            var d0 = d.setFullYear(c0[2], c0[0], c0[1]);
            var d1 = d.setFullYear(c1[2], c1[0], c1[1]);
            return d1 - d0;
        } else {
            return b.count.replace("¥", "") - a.count.replace("¥", "");
        }
    });
}

$(document).ready(()=>{
    //神了,如果不用jquery的$(doc).ready()
    //就必须在body后写js,不然根本没法加载vue,真的牛皮
    initVue();
    fetchData();
});
