import fs from 'fs';
import open from 'open';
//
import { getConfig } from './modules/get-config.js';
import { getImageFileList } from './modules/get-image.js';
import { imageOptimize } from './modules/image-optimize.js';
import { generateSnippets } from './modules/generate-snippets.js';
//
const argv = process.argv.slice(2);
/* ----------------------------------------------------------------
 * 画像最適化
-----------------------------------------------------------------*/
export const optimizeImages = async () => {
  try {
    if (argv.length === 0) {
      console.log('Image optimization started!');
    } else {
      // console.log('Delete non-existent files ', argv);
    }
    const ts_start = Date.now();
    const config = await getConfig();
    const imageFileList = await getImageFileList(config, argv);
    const result = await imageOptimize(config, imageFileList, argv);
    //
    if (argv.length === 0) {
      const snippets = await generateSnippets(config, result);
      fs.writeFile(config.snippetsOption.snippetsFilePath, snippets, function (err) {
        if (err) {
          console.error('スニペットを生成できませんでした。');
          throw err;
        } else {
          console.log('generate Snippets completed!');
          open(config.snippetsOption.snippetsFilePath);
        }
      });
    }
    //
    const ts_end = Date.now();
    const total = `(total:${String((ts_end - ts_start) * 0.001).substring(0, 5)}s)`;
    return argv.length === 0 ? `Image optimization completed!${total}` : result.length > 0 ? `Image optimization completed!${total}` : '';
  } catch (error) {
    console.error(`[optimizing images] ${error}`);
    process.exit(1);
  }
};
