const tvue = require('./My404.vue');
module.exports = ({ router }) => {
    if (typeof window !== 'undefined') {
        router.beforeEach((to, from, next) => {
            if (shouldHandle(to)) {
                to.matched[0].components = tvue;
                next();
            } else {
                next();
            }
        });
    }
}
function shouldHandle(to) {
    let matched = to.matched[0];
    let isDefault404 = matched.name != "not-found" && matched.path === "*";
    let targetTo404Page = matched.path.includes("404.html");
    return isDefault404 || targetTo404Page;
}
