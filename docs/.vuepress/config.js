
module.exports = {
    title: '秋之盒 AUTUMNBOX',
    description: '开源免费易用的ADB工具',
    theme: 'reco',
    cache: false,
    themeConfig: {
        noFoundPageByTencent: false,
        // type: 'CustomHome',
        themePicker: false,
        logo: '/images/icon.png',
        nav: [
            { text: '主页', link: '/' },
            { text: '指南', link: '/guide/' },
            { text: '拓展模块', link: '/extensions/' },

            {
                text: '关于',
                items: [
                    { text: '关于', link: '/about/' },
                    { text: '无偿捐赠', link: '/donate/' },
                ]
            },
            {
                text: '开发',
                items: [
                    { text: '开发文档', link: '/dev-docs/' },
                    { text: '开放源代码', link: '/open-source/' },
                ]
            }
        ],
        sidebar: {
            "/guide/": [
                "",
                "dpm/"
            ],
        },
        lastUpdated: '最后更新',
        startYear: '2017',
        author: 'zsh2491',
        valineConfig: {
            placeholder: "wow",
            appId: 'VLA81Yn1kDUEgE9A99Qwnb1u-gzGzoHsz',// your appId
            appKey: 'CpivAcjiG4W9BWNpS2z47X98', // your appKey
        }
    }
}