const tvue = require('./Test.vue');
module.exports = ({ router }) => {
    if (typeof window !== 'undefined') {
        router.addRoutes([{
            name: 'not-found',
            path: "/not-found",
            component: () => import('./Test.vue'),
        }]);

        router.beforeResolve((to, from, next) => {
            console.log(to.matched);
            if (shouldHandle(to)) {
                console.log("default 404");
                next("/not-found");
            } else {
                next();
            }
        });
        console.log(router);
    }
}
function shouldHandle(to) {
    let matched = to.matched[0];
    let isDefault404 = matched.name != "not-found" && matched.path === "*";
    let targetTo404Page = matched.path.includes("404.html");
    return isDefault404 || targetTo404Page;
}
