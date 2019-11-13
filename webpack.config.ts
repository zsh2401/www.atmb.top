import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin'
import {CleanWebpackPlugin} from 'clean-webpack-plugin'
const config:webpack.Configuration= {
	entry: {
		global:"./src/global",
		pageIndex: './src/entries/page-index',
		pageGo: './src/entries/page-go',
		// pageAbout: './src/pages/about',
		// page404:"./src/pages/404",
		// pageDonate:"./src/pages/donate",
		// pageOS:"./src/pages/opensource",
		// pageExtStore:"./src/pages/ext-store",
		// pageGO:"./src/pages/go",
		// pageGuideReader:"./src/pages/guide-reader",
		// pageCom:"./src/pages/com",
		// pageStory:"./src/pages/story",
		// pageDownload:"./src/pages/download",
		// pageBeta:"./src/pages/beta",
		// pageDownloadV2:"./src/pages/downloadv2",
	},

	//@ts-ignore
	devServer:{
		open:true,
		port:9001,
		host: '0.0.0.0'
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
		publicPath:"/"
	},
	externals:{
		"react":"React",
		"react-dom":"ReactDOM",
		'valine':'Valine',
		'leancloud-storage':'AV',
		"marked":"marked",
		"swiper":"Swiper"
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
		new CopyPlugin([{from:"./src/public",to:"."},]),
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			filename:"index.html",
			template:"./src/static-view/pages/index",
			chunks:["global"]
		}),
		new HtmlWebpackPlugin({
			filename:"download/index.html",
			template:"./src/static-view/pages/download",
			chunks:["global"]
		}),
		new HtmlWebpackPlugin({
			filename:"about/index.html",
			template:"./src/static-view/pages/about",
			chunks:["global"]
		}),
		new HtmlWebpackPlugin({
			filename:"story/index.html",
			template:"./src/static-view/pages/story",
			chunks:["global"]
		}),
		new HtmlWebpackPlugin({
			filename:"beta/index.html",
			template:"./src/static-view/pages/beta",
			chunks:["global"]
		}),
		new HtmlWebpackPlugin({
			filename:"404.html",
			template:"./src/static-view/pages/404",
			chunks:["global"],
		}),
		new HtmlWebpackPlugin({
			filename:"donate/index.html",
			template:"./src/static-view/pages/donate",
			chunks:["global"],
		}),
		new HtmlWebpackPlugin({
			filename:"guide/index.html",
			template:"./src/static-view/pages/guide-reader",
			chunks:["global","pageGuideReader"],
		}),

		new HtmlWebpackPlugin({
			filename:"opensource/index.html",
			template:"./src/static-view/pages/opensource",
			chunks:["global"],
		}),
		new HtmlWebpackPlugin({
			filename:"go/index.html",
			template:"./src/static-view/pages/go",
			chunks:["global","pageGo"],
		}),
		new HtmlWebpackPlugin({
			filename:"extension/index.html",
			template:"./src/static-view/pages/extension-store",
			chunks:["global","pageExtStore"],
		}),
		new HtmlWebpackPlugin({
			filename:"extension/view/index.html",
			template:"./src/static-view/pages/extension-view",
			chunks:["global","pageExtView"],
		}),
		new HtmlWebpackPlugin({
			filename:"com/index.html",
			template:"./src/static-view/pages/commerical/",
			chunks:["global"],
		})
	],

	resolve: {
		extensions: ['.tsx', '.ts', '.js','.css']
	}
};

module.exports = config;