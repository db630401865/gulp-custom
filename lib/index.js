const { src, dest, parallel, series, watch } = require('gulp')
const del = require('del')
const browserSync = require('browser-sync')
const bs = browserSync.create()
const loadPlugins = require('gulp-load-plugins')
const plugins = loadPlugins()
// const sass = require('gulp-sass')(require('sass'))


//当前工作目录process.cwd()
const cwd = process.cwd()
let config = {
  //写一些默认配置文件
  build:{
    src:'src',
    dist:'dist',
    temp:'temp',
    public:'public',
    paths:{
      styles:'assets/styles/*.scss',
      script:'assets/scripts/*.js',
      pages:'*.html',
      images:'assets/images/**',
      fonts:'assets/fonts/**',
    }
  }
}
try{
  const loadConfig = require(`${cwd}/pages.config.js`)
  config = Object.assign({},config,loadConfig)
}catch(e){

}
const style = () => {

  // base:'src' 是基准任务，按照我们下面src的目录结构放到dist目录下
  return src(config.build.paths.styles, { base: config.build.src,cwd:config.build.src })
  // 基本上每个插件都是提供一个函数。并且通过调用返回一个文件的转换流
  // 当我们dist中的css,对其不工整，我们就使用outputStyle : 'expanded'。属性
    .pipe(sass({ outputStyle: 'expanded' }))
  // dest,目标位置。 编译后的结果目录dist
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }))
}
const script = () => {
  // base:'src' 是基准任务，按照我们下面src的目录结构放到dist目录下
  return src(config.build.paths.script, { base: config.build.src,cwd:config.build.src })
  // 基本上每个插件都是提供一个函数。并且通过调用返回一个文件的转换流
  // presets:['@babel/preset-env']preset就是插件转换集合。最新特性的整体打包
    .pipe(plugins.babel({ presets: [require('@babel/preset-env')] }))
  // dest,目标位置。 编译后的结果目录dist
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }))
}

const page = () => {
  // base:'src' 是基准任务，按照我们下面src的目录结构放到dist目录下
  //* */*.html 子目录所有的html
  return src(config.build.paths.pages, { base: config.build.src,cwd:config.build.src })
  // 基本上每个插件都是提供一个函数。并且通过调用返回一个文件的转换流
  // swig({data}此处就是传递的data参数，把提取的公共字段或者json文件渲染到模版上
    .pipe(plugins.swig(
      {
        data:config.data,
        defaults: { cache: false }
      }
    ))
  // dest,目标位置。 编译后的结果目录dist
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }))
}
const images = () => {
  // base:'src' 是基准任务，按照我们下面src的目录结构放到dist目录下
  //* */*.html 子目录所有的html
  return src(config.build.paths.images, { base: config.build.src,cwd:config.build.src })
  // 基本上每个插件都是提供一个函数。并且通过调用返回一个文件的转换流
    .pipe(plugins.imagemin())
  // dest,目标位置。 编译后的结果目录dist
    .pipe(dest(config.build.dist))
    .pipe(bs.reload({ stream: true }))
}
const font = () => {
  // base:'src' 是基准任务，按照我们下面src的目录结构放到dist目录下
  //* */*.html 子目录所有的html
  return src(config.build.paths.fonts, { base: config.build.src,cwd:config.build.src })
  // 基本上每个插件都是提供一个函数。并且通过调用返回一个文件的转换流
    .pipe(plugins.imagemin())
  // dest,目标位置。 编译后的结果目录dist
    .pipe(dest(config.build.dist))
    .pipe(bs.reload({ stream: true }))
}
const extra = () => {
  // base:'src' 是基准任务，按照我们下面src的目录结构放到pubilc目录下.也是移动到dist目录下
  return src('**', { base:config.build.public,cwd:config.build.public })
  // 基本上每个插件都是提供一个函数。并且通过调用返回一个文件的转换流
  // dest,目标位置。 编译后的结果目录dist
    .pipe(dest(config.build.dist))
    .pipe(bs.reload({ stream: true }))
}
const clean = () => {
  // 放入需要清除的目录。他返回的promise对象。他需要任务执行，放到build之前
  return del(config.build.dist)
}
const serve = () => {
  // 监视样式文件.第一个参数是路径，第二个是函数名
  watch(config.build.paths.styles ,{cwd:config.build.src }, style)
  watch(config.build.paths.script ,{cwd:config.build.src }, script)
  watch(config.build.paths.pages ,{cwd:config.build.src }, page)
  // 开发环境没必要执行以下3个监视任务
  // watch('src/assets/images/**',images);
  // watch('src/assets/fonts/**',font);
  // watch('pubilc/**',extra);

  // 把3个任务合在一起，当变化时候，刷新浏览器
  watch([config.build.paths.images, config.build.paths.fonts],{cwd:config.build.src } ,bs.reload)
  watch("**",{cwd:config.build.public } ,bs.reload)

  // 初始化we服务器的一些配置
  bs.init({
    // 弹出框是否需要。可以直接关闭
    notify: false,
    port: 2080,
    // 是否自动打开浏览器
    open: true,
    // 指定改变的目录，使浏览器更新界面

    // 如果不使用files:'dist/**', 属性，每个方法需要加 .pipe(bs.reload({stream:true}))。这个执行刷新
    // files:'dist/**',   .pipe(bs.reload({stream:true}))
    // files: 'temp/**',
    // 指定根目录
    server: {
      // baseDir:'dist', 发环境没必要全部监听，所有使用数组形式
      baseDir: [config.build.temp, config.build.src,  config.build.public], // 数组形式就是从第一个目录去找，如果找到就使用，
      // 如果找不到就在下一个目录，主要是因为没必要去监听别的目录。提高构建效率
      // 专门处理下，node_modules问题，配置一个路由.
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  })
}
const useref = () => {
  // 放入需要清除的目录。他返回的promise对象。他需要任务执行，放到build之前
  return src(config.build.paths.pages, { base: config.build.temp,cwd:config.build.temp })
    .pipe(plugins.useref({ searchPath: [config.build.temp, '.'] }))
  // html,css,js
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
  // htmlmin有个属性，
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({
      collapseWhitespace: true,
      minifyCss: true,
      minifyjs: true
    })))
  // 因为读写在一个文件，所有造成文件缺失。所有，放到一个新的文件
    .pipe(dest(config.build.dist))
}
// style
const compile = parallel(script, page)
const build = series(clean, parallel(series(compile, useref), images, font, extra))
const devolop = series(compile, serve)
 
module.exports = {
  compile,
  build,
  devolop,
  clean
}
