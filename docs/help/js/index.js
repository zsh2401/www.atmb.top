
$(document).ready(()=>{
    setTimeout(()=>{
        $('html, body').animate({scrollTop: $("#" + getUrlParam("node")).offset().top - 50}, 1000);
    },500)
});