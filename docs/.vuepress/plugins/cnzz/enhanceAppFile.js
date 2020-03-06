module.exports = ({ router }) => {
    if (typeof window !== 'undefined') {
        // initWarpper();
        router.afterHooks.push(() => {
            setTimeout(() => {
                reset();
            }, 1000);
        });
    }
}
const __ID = "__cnzz";
function reset() {
    document.getElementById(__ID) && document.getElementById(__ID).remove();
    var warpper = document.createElement('div');
    warpper.id = __ID;
    

    var myScript = document.createElement("script");
    myScript.id = "__cnzz";
    myScript.type = "text/javascript";
    myScript.src = "https://s13.cnzz.com/z_stat.php?id=1272395513&web_id=1272395513";
    warpper.appendChild(myScript);


    var otherScript = document.getElementsByTagName('script')[0];
    otherScript.parentNode.insert(warpper, otherScript);
}
var currentElement = null;
var warpperDiv = null;
function initWarpper() {
    warpperDiv = document.createElement("div");
    document.querySelector("#app").appendChild(warpperDiv);
}
function update() {
    var newElement = rebuildCNZZElement();
    warpperDiv.remove(currentElement);
    warpperDiv.appendChild(newElement);
    console.log(warpperDiv);
    currentElement = newElement;
}
function rebuildCNZZElement() {
    var element = document.createElement('h1');
    element.innerText = "wowowowowowowowow";
    return element;
}