// gulpfile.js

// 必要なモジュールの読み込み
const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass')); // gulp-sass と sass 本体を連携
const plumber = require('gulp-plumber'); // エラーが発生してもGulpが中断しないようにする
const browserSync = require('browser-sync').create(); // browserSyncに対応
const postcss = require('gulp-postcss'); // gulp-postcss を読み込む
const cssnano = require('cssnano'); // cssnano を読み込む
// または
// const bs = require('browser-sync');
const sortMediaQueries = require('postcss-sort-media-queries'); // postcss-sort-media-querieを読み込む

// --- 設定ファイル（パスの定義） ---
const paths = {
  // Sassファイルのソースディレクトリ
  // sass: './src/scss/*.scss', // 任意のディレクトリを設定
  sass: './src/_src/sass/*.scss', // 実践編のディレクトリ構造に対応
  // コンパイルしたCSSファイルの出力先ディレクトリ
  cssDest: './src/css/', // 任意のディレクトリを設定
};

// --- タスク定義 ---

// Sassコンパイルタスク
function sassCompile(cb) {
  const plugins = [
    // 1. Media Queryのソートと結合を最初に行う
    sortMediaQueries({
      // ★ 任意: ソート順を指定（'mobile-first'がデフォルト）
      sort: 'mobile-first',
    }),
    // 2. ベンダープレフィックス自動付与（autoprefixerなど、必要な場合）
    // require('autoprefixer'),
    // 3. 最後に cssnano で圧縮・最適化を行う
    // ※圧縮を無効化または緩和設定追加
    cssnano({
      preset: [
        'default',
        {
          // 改行やスペースの削除を含む、全ての圧縮・最適化を無効化する設定
          // 開発環境では、この設定で圧縮を停止させます。
          normalizeWhitespace: false, // ホワイトスペースの削除を無効化（最重要）
          discardComments: { removeAll: false }, // コメント削除を無効化
          discardUnused: false,
          minifyFontValues: false,
          reduceIdents: false, // セレクタや変数名の短縮化を無効化
          mergeLonghand: false, // ロングハンドからショートハンドへの変換を無効化
        },
      ],
    }),
  ];
  return src(paths.sass, { sourcemaps: true }) // ソースマップを有効にしてSassファイルを読み込む
    .pipe(plumber()) // エラー発生時にGulpが停止するのを防ぐ
    .pipe(sass({ outputStyle: 'expanded' })) // Sassをコンパイル ※後の可読性を考慮しexpanded設定 (outputStyle: 'compressed'で圧縮も可能)
    .pipe(postcss(plugins)) // PostCSSプラグインのリストを適用
    .pipe(dest(paths.cssDest, { sourcemaps: '.' })); // コンパイル後のCSSを出力し、ソースマップを同じ場所に保存
  // タスク完了を示すコールバック関数は、return src... でストリームを返す場合は省略できます
}

// ファイル監視タスク (開発時に使用)
function watchFiles(cb) {
  // paths.sass のファイルに変更があったら sassCompile タスクを実行する
  watch(paths.sass, sassCompile);

  // 2. コンパイル後のCSSファイル（パスは paths.cssDest の中）の変更を監視し、BrowserSyncに通知する
  watch(paths.cssDest + '**/*.css').on('change', browserSync.reload);

  // 3. HTMLファイルなどの変更を監視し、BrowserSyncに通知する (必要に応じてパスを調整)
  watch('*.html').on('change', browserSync.reload);
  cb();
}

// BrowserSync起動タスク
function browserSyncInit(cb) {
  browserSync.init({
    // ブラウザを自動で開く
    open: true,
    // BrowserSyncが配信するルートディレクトリを指定
    server: {
      baseDir: './',
    },
    // CSSインジェクションを有効にする
    notify: false,
  });
  cb();
}

// --- コマンド実行時に呼び出されるタスクの定義 ---

// 開発用コマンド: `gulp dev` で実行。ファイルの変更を監視しながら開発する
exports.dev = series(
  sassCompile, // 最初にSassをコンパイル
  browserSyncInit, // BrowserSyncを起動
  watchFiles, // ファイル監視を開始
);

// 本番ビルド用コマンド: `gulp build` で実行。コンパイルのみ行う
exports.build = sassCompile;

// デフォルトコマンド: `gulp` で実行。開発用コマンドと同じ動作
exports.default = exports.dev;
