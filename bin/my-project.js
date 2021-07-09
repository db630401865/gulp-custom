#!/usr/bin/env node

process.argv.push('--cwd')
///Users/dongbo/Desktop/归档/my-project
process.argv.push(process.cwd()) 
process.argv.push('--gulpfile')
//require载入这个模块， resolve()  找到这个模块的路径，
//Users/dongbo/Desktop/归档/my-project/lib/index.js
process.argv.push(require.resolve('..')) 

require('gulp/bin/gulp')