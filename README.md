# package.optimize-image
Image Optimization

## install
```
npm install @lf-dev/optimize-image -D
```

## add scripts

```
"optimize:images": "optimizeImages",
"optimize:watch": "onchange \"src/template/lp/assets/img/**/*.*\" -- optimizeImages {{changed}}"
```

### src内の画像を一括書き出し
```
npm run optimize:images
```
 - 一括書き出し後、Snippets Viewerが立ち上がります

### 特定の画像のみ画像を生成
```
npm run optimize:images -- src/assets/img/kv/img-kv01.jpg
```
 - -- ダブルハイフンの後に画像のパスを引数として指定  
（複数ファイルの場合には半角で区切る）
 - スニペットの更新は行われません

### src/assets/img/内の変更を検知し、画像の自動書き出し
```
npm run optimize:watch
```
 - ※未検証
 - スニペットの更新は行われません
 - onchangeのpackageが必要```npm i onchange -D```


## overview

### input → output
src/assets/img/に大元の画像を配置して、   
public/assets/imgに書き出します。  
※ディレクトリは設定ファイルで変更可能です。

### 機能
 - 画像の圧縮
 - WebP画像の書き出し
 - Avif画像の書き出し
 - レスポンシブ画像の書き出し
    - _pc,_spという接尾語をファイル名に付与し、pc/sp切り替え用のコードを生成します
    - @3xという接尾語をファイル名に付与すると@2x,@1xの画像を書き出してコードを生成します
    - @2xという接尾語をファイル名に付与すると@1xの画像を書き出してコードを生成します



## config file
.optimizeImagesrc.mjs
```
export default {
  // 圧縮対象の画像ファイル一式が格納されているディレクトリ
  inputImageDir: 'src/template/lp/assets/img',
  // 書き出し先のディレクトリ
  outputImageDir: 'public/template/lp/assets/img',
  // 書き出し先のディレクトリを空にするかどうか
  emptyOutputDir: true,
  // 圧縮対象の画像ファイルの拡張子 ※対象外の拡張子が含まれる場合にはエラー
  targetExtensions: ['jpg', 'jpeg', 'png', 'svg'],
  // SVGの圧縮を行うかどうか
  SVG: true,
  // WebPの生成を行うかどうか
  WebP: true,
  // Avifの生成を行うかどうか
  Avif: true,
  // 解像度：@2x→@1x(1/2)の画像を生成、@3x→@2x(1/1.5),@1x(1/3)の画像を生成 ※縮小のみ対応
  resolutionScaling: true,
  // 画像の圧縮設定（sharp：https://sharp.pixelplumbing.com/）
  encoderOptions: {
    png: {
      // compressionLevel: 9,
      adaptiveFiltering: true,
      quality: 100,
    },
    jpg: {
      quality: 80,
      mozjpeg: true,
    },
    avif: {
      quality: 50,
    },
    webp: {
      quality: 75,
    },
  },
  // SVGの圧縮設定（SVGO：https://svgo.dev/docs/introduction/）
  svgoConfig: {
    plugins: [
      'removeDimensions',
      {
        name: 'preset-default',
        params: {
          overrides: {
            // customize default plugin options
            // inlineStyles: {
            //   onlyMatchedOnce: false,
            // },
            // or disable plugins
            //removeDoctype: false,
          },
        },
      },
    ],
  },
  // スニペットの生成を行うかどうか
  snippets: true,
  snippetsOption: {
    // srcに追加する書き出し先のディレクトリのパス
    path: '/template/lp/assets/img',
    // publicフォルダのパス
    public: './public',
    // 書き出すファイルのパス
    snippetsFilePath: './_snippets.html',
    breakpoint: 768,
    responsiveSuffix: {
      pc: '_pc',
      sp: '_sp',
    },
  },
};
```


## TODO
 - デフォルトのOption設定 ※wip
 - Snippets Viewerのデザインブラッシュアップ ※wip
 - 絞り込み → 絞り込み結果の「All Copy」 ※wip
 - モーダル内に画像の全体表示
   - 元画像と形式ごとの画質比較チェック（容量も）
 - watch時にもスニペットを更新
 - 生成コードをオプションで切り替え（avif offとか）
 - リファクタリング + Snippets Viewerをフレームワークを使ってちゃんと作る
 - 生成AIを使用してAltを自動生成するボタンを追加？（自身のAPI Keyを入力）
