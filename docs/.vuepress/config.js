
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
            { text: '主页', link: '/' ,icon:"reco-home"},
            { text: '指南', link: '/guide/' ,icon:"reco-document"},
            { text: '拓展模块', link: '/extensions/',icon:"reco-category" },

            {
                text: '关于',
                icon:"reco-other",
                items: [
                    { text: '关于', link: '/about/' },
                    { text: '无偿捐赠', link: '/donate/' },
                ]
            },
            {
                text: '开发',
                icon: 'reco-api',
                items: [
                    { text: '开发文档', link: '/dev-docs/' },
                    { text: '开放源代码', link: '/open-source/',icon:"reco-github" },
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
        author: 'zsh2401<zsh2401@163.com>',
        valineConfig: {
            placeholder: "wow",
            appId: 'VLA81Yn1kDUEgE9A99Qwnb1u-gzGzoHsz',// your appId
            appKey: 'CpivAcjiG4W9BWNpS2z47X98', // your appKey
        }
    }
}