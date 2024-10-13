import path from 'path';
import { readFile } from 'fs/promises';
import { pathToFileURL } from 'url';
/* ----------------------------------------------------------------
 * 設定ファイルの読み込み
-----------------------------------------------------------------*/
export const getConfig = async () => {
  try {
    // read package.json.
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    const packageConfig = packageJson.optimizeImages || {};

    // import rc config.
    const rcConfigPath = path.join(process.cwd(), '.optimizeImagesrc.mjs');
    const rcConfigFile = await import(pathToFileURL(rcConfigPath));
    const rcConfig = rcConfigFile.default || {};

    // merge package.json and rc config.
    const config = Object.assign(packageConfig, rcConfig);

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
