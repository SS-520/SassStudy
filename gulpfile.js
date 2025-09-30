// gulpfile.js

// 必要なモジュールの読み込み
const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass')); // gulp-sass と sass 本体を連携
const plumber = require('gulp-plumber'); // エラーが発生してもGulpが中断しないようにする

// --- 設定ファイル（パスの定義） ---
const paths = {
  // Sassファイルのソースディレクトリ
  sass: './src/scss/*.scss', // 任意のディレクトリを設定
  // コンパイルしたCSSファイルの出力先ディレクトリ
  cssDest: './src/css/', // 任意のディレクトリを設定
};

// --- タスク定義 ---

// Sassコンパイルタスク
function sassCompile(cb) {
  return src(paths.sass, { sourcemaps: true }) // ソースマップを有効にしてSassファイルを読み込む
    .pipe(plumber()) // エラー発生時にGulpが停止するのを防ぐ
    .pipe(sass({ outputStyle: 'expanded' })) // Sassをコンパイル ※後の可読性を考慮しexpanded設定 (outputStyle: 'compressed'で圧縮も可能)
    .pipe(dest(paths.cssDest, { sourcemaps: '.' })); // コンパイル後のCSSを出力し、ソースマップを同じ場所に保存
  // タスク完了を示すコールバック関数は、return src... でストリームを返す場合は省略できます
}

// ファイル監視タスク (開発時に使用)
function watchFiles(cb) {
  // paths.sass のファイルに変更があったら sassCompile タスクを実行する
  watch(paths.sass, sassCompile);
  cb();
}

// --- コマンド実行時に呼び出されるタスクの定義 ---

// 開発用コマンド: `gulp dev` で実行。ファイルの変更を監視しながら開発する
exports.dev = series(sassCompile, watchFiles);

// 本番ビルド用コマンド: `gulp build` で実行。コンパイルのみ行う
exports.build = sassCompile;

// デフォルトコマンド: `gulp` で実行。開発用コマンドと同じ動作
exports.default = exports.dev;
