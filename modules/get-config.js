import path from 'path';
import { readFile } from 'fs/promises';
import { pathToFileURL } from 'url';
/* ----------------------------------------------------------------
 * 設定ファイルの読み込み
-----------------------------------------------------------------*/
export const getConfig = async () => {
  // set default value.
  const defaultConfig = {
    // 圧縮対象の画像ファイル一式が格納されているディレクトリ
    inputImageDir: 'src/assets/img',
    // 書き出し先のディレクトリ
    outputImageDir: 'public/assets/img',
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
      path: '/assets/img',
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

  // read package.json.
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  const packageConfig = packageJson.optimizeImages || {};

  let rcConfig = {};
  try {
    // import rc config.
    const rcConfigPath = path.join(process.cwd(), '.optimizeImagesrc.mjs');
    const rcConfigFile = await import(pathToFileURL(rcConfigPath));
    rcConfig = rcConfigFile.default || {};
  } catch (error) {
    console.log(`[not reading .optimizeImagesrc.mjs]`);
  }

  try {
    // merge package.json and rc config.
    const config = Object.assign(defaultConfig, packageConfig, rcConfig);

    /* throw Error
    --------------------------------------------*/
    // exists check: config.
    if (!config || Object.keys(config).length === 0) {
      throw new Error('Config for optimizeImages not found!');
    }

    // exists check: inputImageDir.
    else if (!config.inputImageDir) {
      throw new Error('inputImageDir not found in config file!');
    }
    // exists check: outputImageDir.
    else if (!config.outputImageDir) {
      throw new Error('outputImageDir not found in config file!');
    }

    /* set default value.
    --------------------------------------------*/
    // exists check: extensions.
    if (!config.targetExtensions || config.targetExtensions.length === 0) {
      config.targetExtensions = ['jpg', 'jpeg', 'png', 'svg'];
    }

    /* return
    --------------------------------------------*/
    return config;
  } catch (error) {
    console.error(`[reading package.json] ${error}`);
    process.exit(1);
  }
};
