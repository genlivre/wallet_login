const gulp = require("gulp"); //gulp本体
const del = require("del");

//scss
const sass = require("gulp-dart-sass"); //Dart Sass はSass公式が推奨 @use構文などが使える
const plumber = require("gulp-plumber"); // エラーが発生しても強制終了させない
const notify = require("gulp-notify"); // エラー発生時のアラート出力
const browserSync = require("browser-sync"); //ブラウザリロード
const autoprefixer = require("gulp-autoprefixer"); //ベンダープレフィックス自動付与
// const postcss = require("gulp-postcss");//css-mqpackerを使うために必要
// const mqpacker = require('css-mqpacker');//メディアクエリをまとめる

//画像圧縮
const imagemin = require("gulp-imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminPngquant = require("imagemin-pngquant");
const imageminSvgo = require("imagemin-svgo");

// 入出力するフォルダを指定
const srcBase = "./_static/src";
const distBase = "./_static/dist";

const srcPath = {
  site_sorce: srcBase + "/site_sorce/*",
  scss: srcBase + "/scss/**/*.scss",
  html: srcBase + "/**/*.html",
  img: srcBase + "/img/**/*",
  js: srcBase + "/javascript/**/*",
  ejs: srcBase + "/ejs/**/*",
};

const distPath = {
  site_sorce: distBase + "/",
  css: distBase + "/css/",
  html: distBase + "/",
  img: distBase + "/img/",
  js: distBase + "/javascript/",
};

/**
 * clean
 */
const clean = () => {
  return del(distBase + "/**");
};

//ベンダープレフィックスを付与する条件
const TARGET_BROWSERS = [
  "last 2 versions", //各ブラウザの2世代前までのバージョンを担保
  "ie >= 11", //IE11を担保
];

/**
 * sass
 *
 */
const cssSass = () => {
  return (
    gulp
      .src(srcPath.scss, {
        sourcemaps: true,
      })
      .pipe(
        //エラーが出ても処理を止めない
        plumber({
          errorHandler: notify.onError("Error:<%= error.message %>"),
        })
      )
      .pipe(sass({ outputStyle: "compressed" })) //指定できるキー expanded compressed
      .pipe(autoprefixer(TARGET_BROWSERS)) // ベンダープレフィックス自動付与
      // .pipe(postcss([mqpacker()])) // メディアクエリをまとめる
      .pipe(gulp.dest(distPath.css, { sourcemaps: "./" })) //コンパイル先
      .pipe(browserSync.stream())
      .pipe(
        notify({
          message: "Sassをコンパイルしました！",
          onLast: true,
        })
      )
  );
};

/**
 * jsを圧縮
 *
 */
const compressJs = () => {
  return gulp.src(srcPath.js).pipe(gulp.dest(distPath.js));
};

/**
 * 画像圧縮
 */
const imgImagemin = () => {
  return gulp
    .src(srcPath.img)
    .pipe(
      //エラーが出ても処理を止めない
      plumber({
        errorHandler: notify.onError("Error:<%= error.message %>"),
      })
    )
    .pipe(
      imagemin(
        [
          imageminMozjpeg({
            quality: 50,
          }),
          imageminPngquant({
            quality: [0.4, 0.6],
          }),
          imageminSvgo({
            plugins: [{ name: "removeViewBox", active: false }],
          }),
        ],
        {
          verbose: true,
        }
      )
    )
    .pipe(gulp.dest(distPath.img));
};

/**
 * html
 */
const html = () => {
  return gulp.src(srcPath.html).pipe(gulp.dest(distPath.html));
};

/**
 * js
 */
const js = () => {
  return gulp.src(srcPath.js).pipe(gulp.dest(distPath.js));
};

/**
 * site_sorce
 */
const site_sorce = () => {
  return gulp.src(srcPath.site_sorce).pipe(gulp.dest(distPath.site_sorce));
};

/**
 * ejs
 */
var rename = require("gulp-rename");
var ejs = require("gulp-ejs");
var replace = require("gulp-replace");

const createEjs = () => {
  return gulp
    .src([`${srcBase}/ejs/**/*.ejs`, `!${srcBase}/ejs/**/_*.ejs`])
    .pipe(ejs({}, {}, { ext: ".html" }))
    .pipe(rename({ extname: ".html" }))
    .pipe(replace(/[\s\S]*?(<!DOCTYPE)/, "$1"))
    .pipe(gulp.dest(distBase));
};

/**
 * ローカルサーバー立ち上げ
 */
const browserSyncFunc = () => {
  browserSync.init(browserSyncOption);
};

const browserSyncOption = {
  server: "./_static/dist/",
};

/**
 * リロード
 */
const browserSyncReload = (done) => {
  browserSync.reload();
  done();
};

/**
 *
 * ファイル監視 ファイルの変更を検知したら、browserSyncReloadでreloadメソッドを呼び出す
 * series 順番に実行
 * watch('監視するファイル',処理)
 */
const watchFiles = () => {
  gulp.watch(srcPath.ejs, gulp.series(createEjs, browserSyncReload));
  gulp.watch(srcPath.scss, gulp.series(cssSass));
  gulp.watch(srcPath.html, gulp.series(html, browserSyncReload));
  gulp.watch(srcPath.js, gulp.series(compressJs, browserSyncReload));
  gulp.watch(srcPath.img, gulp.series(imgImagemin, browserSyncReload));
};

/**
 * seriesは「順番」に実行
 * parallelは並列で実行
 */
exports.default = gulp.series(
  clean,
  gulp.parallel(createEjs, site_sorce, html, cssSass, compressJs, imgImagemin),
  gulp.parallel(watchFiles, browserSyncFunc)
);
