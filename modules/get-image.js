import { glob } from 'glob';
import path from 'path';
/* ----------------------------------------------------------------
 * 画像ファイルリストの取得
-----------------------------------------------------------------*/
export const getImageFileList = async (config, argv) => {
  try {
    // 画像ファイルリストを取得
    let imageFileList = [];
    if (argv.length > 0) {
      imageFileList = argv;
    } else {
      imageFileList = await glob(config.inputImageDir + '/**/*.*');
    }
    if (imageFileList.length === 0) {
      throw new Error('File not found!');
    }

    // 除外するファイルリスト
    const allowedExtensions = new Set(config.targetExtensions);
    const invalidFiles = imageFileList.filter((file) => {
      const ext = path.extname(file).toLowerCase().slice(1);
      return !allowedExtensions.has(ext);
    });

    // 対象外のファイルがある場合はエラーをスロー
    if (invalidFiles.length > 0) {
      const invalidExtensions = new Set(invalidFiles.map((file) => path.extname(file).toLowerCase().slice(1)));
      throw new Error(`Invalid file extensions found: ${Array.from(invalidExtensions).join(', ')}. Allowed extensions are: ${Array.from(allowedExtensions).join(', ')}.`);
    }

    // ディレクトリごとにファイルをグループ化
    const groupedFiles = imageFileList.reduce((acc, file) => {
      const dir = path.dirname(file);
      if (!acc[dir]) {
        acc[dir] = [];
      }
      acc[dir].push(file);
      return acc;
    }, {});

    // 各グループ内でファイルをソートし、結果を1つの配列にまとめる
    const sortedFiles = Object.values(groupedFiles).flatMap((group) => {
      return group.sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
    });

    return sortedFiles;

    //
  } catch (error) {
    console.error(`[get ImageFileList] ${error}`);
    process.exit(1);
  }
};
