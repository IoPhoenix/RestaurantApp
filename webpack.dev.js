const webpack = require('webpack');
const path = require('path');

/*
 * SplitChunksPlugin is enabled by default and replaced
 * deprecated CommonsChunkPlugin. It automatically identifies modules which
 * should be splitted of chunk by heuristics using module duplication count and
 * module category (i. e. node_modules). And splits the chunks…
 *
 * It is safe to remove "splitChunks" from the generated configuration
 * and was added as an educational example.
 *
 * https://webpack.js.org/plugins/split-chunks-plugin/
 *
 */

/*
 * We've enabled UglifyJSPlugin for you! This minifies your app
 * in order to load faster and run less javascript.
 *
 * https://github.com/webpack-contrib/uglifyjs-webpack-plugin
 *
 */

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
	module: {
		rules: [
			{
				include: [path.resolve(__dirname, 'src')],
				loader: 'babel-loader',

				options: {
					plugins: ['syntax-dynamic-import'],

					presets: [
						[
							'env',
							{
								modules: false
							}
						]
					]
				},

				test: /\.js$/,
				exclude: /node_modules/
			}
		]
	},
	plugins: [new UglifyJSPlugin()],

	// Set the output paths as the entry key
	// use the name as output template
	entry: {
		'temp/assets/scripts/app': './app/assets/scripts/app.js',
		'temp/assets/scripts/restaurant': './app/assets/scripts/restaurant.js',
		'sw': './app/service-worker.js'
	},

	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, './app')
	},

	mode: 'development'
};
