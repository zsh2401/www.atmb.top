import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin'
const config:webpack.Configuration= {
	mode: 'development',
	entry: {
		site: './src/lib/site',
		pageIndex: './src/pages/index',
		pageAbout: './src/pages/about',
		page404:"./src/pages/404",
		pageDonate:"./src/pages/donate",
		pageOS:"./src/pages/opensource",
		pageExtStore:"./src/pages/ext-store",
		pageGO:"./src/pages/go",
		pageGuideReader:"./src/pages/guide-reader",
		pageCom:"./src/pages/com",
		pageStory:"./src/pages/story",
		pageDownload:"./src/pages/download",
	},
	//@ts-ignore
	devServer:{
		contentBase: __dirname + '/dist',
		port:9001,
		host: '0.0.0.0'
	},
	output: {
		filename: 'js/[name].js',
		path: path.resolve(__dirname, 'dist'),
		publicPath:"/"
	},
	externals:{
		"react":"React",
		"react-dom":"ReactDOM",
		'valine':'Valine',
		'leancloud-storage':'AV',
		"marked":"marked"
	},
	
	module: {
		rules: [
			{ test: /\.ts(x?)$/, use: 'ts-loader' },
			{ test: /\.css$/, use: [
                {
                    loader: "style-loader"
                }, {
                    loader: "css-loader"
                }
                ] 
			},
			// { test: /\.json$/, use: "json-loader"},
			{ test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|bmp|svg|ttf|woff|woff2)(\?.*)?$/, 
                use: {
                        loader:'url-loader?limit=100000&name=images/[name]_[hash:8].[ext]'
                }
            }
		]
	},

	optimization: {
		splitChunks: {
			cacheGroups: {
				vendors: {
					priority: -10,
					test: /[\\/]node_modules[\\/]/
				}
			},

			chunks: 'async',
			minChunks: 1,
			minSize: 30000,
			name: true
		}
	},

	plugins: [
		new webpack.ProgressPlugin(), 
		new CopyPlugin([
			{from:"./src/assets/copy-to-root/",to:"."},
			{from:"./src/assets/copy-to-root-obsolute/",to:"."},
			{from:"./src/constants/exts/icons/",to:"./images/ext_icons"},
			{from:"./src/constants/exts/pics/",to:"./images/ext_pics"},
			{from:"./src/constants/homev2.xaml",to:"./_api_/home_v2/home.xaml"},
			{from:"./src/constants/help",to:"./_data_/help"},
			{from:"./src/constants/help/assets",to:"./help/assets"},
			{from:"./src/constants/update.json",to:"./_api_/update/index.html"},
		]),
		new HtmlWebpackPlugin({
			filename:"index.html",
			template:"./src/StdPage.tsx",
			title:"秋之盒",
			desc:"开源易用,免费的安卓手机助手",
			chunks:["site","pageIndex"],
			hash:true,
			xhtml:true,
		}),
		new HtmlWebpackPlugin({
			filename:"/about/index.html",
			template:"./src/StdPage.tsx",
			title:"联系",
			desc:"联系秋之盒开发者",
			chunks:["site","pageAbout"],
			hash:true,
			xhtml:true,
		}),
		new HtmlWebpackPlugin({
			filename:"404.html",
			template:"./src/StdPage.tsx",
			title:"404 NOT FOUND!",
			chunks:["site","page404"],
			hash:true,
			xhtml:true,
		}),
		new HtmlWebpackPlugin({
			filename:"/donate/index.html",
			template:"./src/StdPage.tsx",
			title:"捐赠秋之盒",
			chunks:["site","pageDonate"],
			hash:true,
			xhtml:true,
		}),
		new HtmlWebpackPlugin({
			filename:"/help/index.html",
			template:"./src/StdPage.tsx",
			title:"说明书",
			chunks:["site","pageGuideReader"],
			hash:true,
			xhtml:true,
		}),
		new HtmlWebpackPlugin({
			filename:"/opensource/index.html",
			template:"./src/StdPage.tsx",
			title:"开放源代码",
			chunks:["site","pageOS"],
			hash:true,
			xhtml:true,
		}),
		new HtmlWebpackPlugin({
			filename:"/go/index.html",
			template:"./src/StdPage.tsx",
			title:"跳转",
			chunks:["site","pageGO"],
			hash:true,
			xhtml:true,
		}),
		new HtmlWebpackPlugin({
			filename:"/extension/index.html",
			template:"./src/pages/ext-store/template.tsx",
			title:"拓展模块市场",
			chunks:["site","pageExtStore"],
			exts_path:path.resolve(__dirname,"./src/constants/exts"),
			hash:true,
			xhtml:true,
		}),
		new HtmlWebpackPlugin({
			filename:"/com/index.html",
			template:"./src/StdPage.tsx",
			title:"商务合作",
			chunks:["site","pageCom"],
			hash:true,
			xhtml:true,
		}),
		new HtmlWebpackPlugin({
			filename:"/story/index.html",
			template:"./src/StdPage.tsx",
			title:"故事",
			chunks:["site","pageStory"],
			hash:true,
			xhtml:true,
		}),
		new HtmlWebpackPlugin({
			filename:"/download/index.html",
			template:"./src/StdPage.tsx",
			title:"下载",
			chunks:["site","pageDownload"],
			hash:true,
			xhtml:true,
		}),
	],

	resolve: {
		extensions: ['.tsx', '.ts', '.js']
	}
};

module.exports = config;