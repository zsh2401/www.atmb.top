var __DONATION_DATA_URL = "/_data_/donors.json";
var vm = null;
function initVue() {
    vm = new Vue({
        el: "#donationsDiv",
        data: { 
            donations: null,
            countOfDonation:0,
            totalOfDonation:0.0
        }
    });
}
function fetchData() {
    fetch(__DONATION_DATA_URL)
        .then(response => response.json())
        .then(json => {
            vm.$data.donations = sortDonations(json);
            vm.$data.countOfDonation = json.length;
            vm.$data.totalOfDonation = calculateTotal(json);
        })
        .catch(err => {
            console.log(err);
        });
}
function completeData(crt){
        if(crt.priority == null){
            crt.priority = 0;
        }
        if(crt.name == null){
            crt.name = "佚名";
        }
        if(crt.t == null){
            crt.t = "捐赠";
        }
        if(crt.date == null){
            crt.date = "未知";
        }
}
function calculateTotal(arr){
    var total = 0.00;
    var currentNum;
    for(var i=0;i<arr.length;i++){
        currentNum = arr[i].amount .replace("¥", "");
        total+= parseFloat(currentNum);
    }
    return total.toFixed(2);
}
function sortDonations(arr) {
    var sortedWithCount = arr.sort(function (a, b) {
        completeData(a);
        if (a.amount === b.amount ) {
            return isEarlyThan(a,b);
        } else {
            return b.amount .replace("¥", "") - a.amount .replace("¥", "");
        } 
    });
    return sortedWithCount.sort(function(a,b){
        return b.priority - a.priority;
    })
}
var __d = new Date();
function isEarlyThan(a,b){
    var c0 = a.date.split('/');
    var c1 = b.date.split('/');
    var d0 = __d.setFullYear(c0[2], c0[0], c0[1]);
    var d1 = __d.setFullYear(c1[2], c1[0], c1[1]);
    return d1 - d0;
}

$(document).ready(()=>{
    //神了,如果不用jquery的$(doc).ready()
    //就必须在body后写js,不然根本没法加载vue,真的牛皮
    initVue();
    fetchData();
});
