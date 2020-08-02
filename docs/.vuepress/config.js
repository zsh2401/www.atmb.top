module.exports = {
    title: '秋之盒',
    description: '开源免费易用的ADB工具',
    theme: 'reco',
    cache: false,

    head: [
        ['script', { "async": true, "data-ad-client": "ca-pub-9452158391330419", src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" }]
    ],
    plugins: [
        require('./plugins/custom-not-found'),
        [
            '@vuepress/google-analytics',
            {
                'ga': 'UA-113227184-2'
            },
        ]
    ],
    themeConfig: {
        // 博客配置
        blogConfig: {
            // category: {
            //     location: -1,     // 在导航栏菜单中所占的位置，默认2
            //     text: '文章分区' // 默认文案 “分类”
            // },
            // tag: {
            //     location: 3,     // 在导航栏菜单中所占的位置，默认3
            //     text: 'Tag'      // 默认文案 “标签”
            // }
        },
        noFoundPageByTencent: false,
        type: 'CustomHome',
        evergreen: false,
        logo: '/images/icon.png',
        nav: [
            {
                text: '主页',
                icon: "reco-home",
                items: [
                    { text: '主页', link: '/' },
                    { text: '开发动态', link: 'https://zsh2401.top/categories/AutumnBox/' },
                ]
            },
            { text: '下载', link: '/download/', icon: "reco-other" },
            { text: '指南', link: '/guide/', icon: "reco-document" },
            { text: '拓展模块', link: '/extensions/', icon: "reco-category" },

            {
                text: '关于',
                icon: "reco-eye",
                items: [
                    { text: '关于', link: '/about/' },
                    { text: '无偿捐赠', link: '/donate/' },
                ]
            },
            {
                text: '开发',
                icon: 'reco-api',
                items: [
                    { text: '开发文档', link: '/dev/docs/' },
                    { text: '开放源代码', link: '/dev/os/', icon: "reco-github" },
                ]
            }
        ],
        sidebar: {
            "/guide/": [
                {
                    title: '入门',   // 必要的
                    // path: '/guide/',      // 可选的, 应该是一个绝对路径
                    collapsable: false, // 可选的, 默认值是 true,
                    sidebarDepth: 4,    // 可选的, 默认值是 1
                    children: [
                        '/guide/',
                        "/guide/basic/run/",
                        "/guide/basic/adb_fail/",
                        {
                            title: '连接设备',   // 必要的
                            // path: '/guide/',      // 可选的, 应该是一个绝对路径
                            collapsable: false, // 可选的, 默认值是 true,
                            sidebarDepth: 2,    // 可选的, 默认值是 1
                            children: [
                                '/guide/basic/cdev/',
                                '/guide/basic/cdev/chuawei.html'

                            ]
                        },
                        "/guide/basic/dpm/",
                        "/guide/basic/ext/",
                        "/guide/basic/script/",

                    ]
                },
                {
                    title: '进阶',   // 必要的
                    // path: '/guide/',      // 可选的, 应该是一个绝对路径
                    collapsable: false, // 可选的, 默认值是 true,
                    sidebarDepth: 2,    // 可选的, 默认值是 1
                    children: [
                        '/guide/advanced/',
                        '/guide/advanced/wifi_delete_x/',
                        '/guide/advanced/jump_google/',
                        '/guide/advanced/something_about_android/',
                    ]
                },
                {
                    title: 'ADB',   // 必要的
                    // path: '/guide/',      // 可选的, 应该是一个绝对路径
                    collapsable: false, // 可选的, 默认值是 true,
                    sidebarDepth: 2,    // 可选的, 默认值是 1
                    children: [
                        '/guide/adb/',
                        '/guide/adb/install/',
                        '/guide/adb/enable/',
                        '/guide/adb/use/',
                    ]
                }
            ],
            "/extensions/": [
                {
                    title: '拓展模块',   // 必要的
                    sidebarDepth: 2,    // 可选的, 默认值是 1
                    children: [
                        '/extensions/',

                    ]
                },
                {
                    title: '拓展模块市场',   // 必要的
                    sidebarDepth: 2,    // 可选的, 默认值是 1
                    children: [
                        '/extensions/store/',

                    ]
                }
            ],
            "/dev/docs/": [
                {
                    title: '入门',   // 必要的
                    sidebarDepth: 2,    // 可选的, 默认值是 1
                    children: [
                        '/dev/docs/',

                    ]
                },
                {
                    title: '进阶',   // 必要的
                    sidebarDepth: 2,    // 可选的, 默认值是 1
                    children: [
                        '/dev/docs/advanced/',
                    ]
                }
            ],
            "/download/": [
                {
                    title: '下载秋之盒',   // 必要的
                    collapsable: false,
                    sidebarDepth: -1,    // 可选的, 默认值是 1
                    children: [
                        '/download/',
                        "/download/canary/",
                        "/download/env/"
                    ]
                },
            ]

        },
        lastUpdated: '最后更新',
        startYear: '2017',
        author: 'AutumnBox',
        valineConfig: {
            placeholder: "遵守法律法规,理性发言。",
            appId: 'VLA81Yn1kDUEgE9A99Qwnb1u-gzGzoHsz',// your appId
            appKey: 'CpivAcjiG4W9BWNpS2z47X98', // your appKey
        }
    }
}