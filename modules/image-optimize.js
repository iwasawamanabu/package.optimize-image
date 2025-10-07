import fs from 'fs';
import path from 'path';
import readline from 'readline';
//
import fse from 'fs-extra';
import sizeOf from 'image-size';
//
import { imageCompress } from './image-compress.js';
import { animateProcessing } from './animate-processing.js';
import { highlight } from './console-highlight.js';

/* ----------------------------------------------------------------
 * 画像最適化
-----------------------------------------------------------------*/
export const imageOptimize = async (config, imageFileList, argv) => {
  try {
    const result = [];
    const imgLength = imageFileList.length;

    // emptyOutputDirがtrueの場合：出力先のディレクトリを空にする
    if (config.emptyOutputDir && argv.length === 0) {
      await fse.emptyDirSync(config.outputImageDir);
    }

    // 画像最適化
    let progress = 1;
    for (const file of imageFileList) {
      /* 該当ファイルがない場合は削除
      -------------------------------------------------- */
      if (!fs.existsSync(file)) {
        // Windows対応: パスを正規化
        const normalizedInputDir = path.normalize(config.inputImageDir);
        const normalizedOutputDir = path.normalize(config.outputImageDir);
        const normalizedFile = path.normalize(file);

        const deleteFile = {};
        deleteFile.file = normalizedFile.replace(normalizedInputDir, normalizedOutputDir);
        deleteFile.fileLabel = path.basename(file, path.extname(file)); // ファイル名を取得
        deleteFile.fileExtension = path.extname(file).replace('.', ''); // ファイルの拡張子を取得
        deleteFile.resolutionScaling = deleteFile.fileLabel.includes('@3x') ? '@3x' : deleteFile.fileLabel.includes('@2x') ? '@2x' : '';

        // ファイルが存在する場合のみ削除
        if (fs.existsSync(deleteFile.file)) {
          fs.unlinkSync(deleteFile.file);
        }

        if (deleteFile.fileExtension != 'svg') {
          if (config.resolutionScaling && deleteFile.resolutionScaling === '@3x') {
            const file2x = deleteFile.file.replace('@3x', '@2x');
            const file1x = deleteFile.file.replace('@3x', '@1x');
            if (fs.existsSync(file2x)) fs.unlinkSync(file2x);
            if (fs.existsSync(file1x)) fs.unlinkSync(file1x);
          } else if (config.resolutionScaling && deleteFile.resolutionScaling === '@2x') {
            const file1x = deleteFile.file.replace('@2x', '@1x');
            if (fs.existsSync(file1x)) fs.unlinkSync(file1x);
          }

          // WebP
          if (config.WebP) {
            deleteFile.fileWebP = deleteFile.file.replace(`.${deleteFile.fileExtension}`, '.webp');
            if (fs.existsSync(deleteFile.fileWebP)) {
              fs.unlinkSync(deleteFile.fileWebP);
            }
            if (config.resolutionScaling && deleteFile.resolutionScaling === '@3x') {
              const webp2x = deleteFile.fileWebP.replace('@3x', '@2x');
              const webp1x = deleteFile.fileWebP.replace('@3x', '@1x');
              if (fs.existsSync(webp2x)) fs.unlinkSync(webp2x);
              if (fs.existsSync(webp1x)) fs.unlinkSync(webp1x);
            } else if (config.resolutionScaling && deleteFile.resolutionScaling === '@2x') {
              const webp1x = deleteFile.fileWebP.replace('@2x', '@1x');
              if (fs.existsSync(webp1x)) fs.unlinkSync(webp1x);
            }
          }

          // Avif
          if (config.Avif) {
            deleteFile.fileAvif = deleteFile.file.replace(`.${deleteFile.fileExtension}`, '.avif');
            if (fs.existsSync(deleteFile.fileAvif)) {
              fs.unlinkSync(deleteFile.fileAvif);
            }
            if (config.resolutionScaling && deleteFile.resolutionScaling === '@3x') {
              const avif2x = deleteFile.fileAvif.replace('@3x', '@2x');
              const avif1x = deleteFile.fileAvif.replace('@3x', '@1x');
              if (fs.existsSync(avif2x)) fs.unlinkSync(avif2x);
              if (fs.existsSync(avif1x)) fs.unlinkSync(avif1x);
            } else if (config.resolutionScaling && deleteFile.resolutionScaling === '@2x') {
              const avif1x = deleteFile.fileAvif.replace('@2x', '@1x');
              if (fs.existsSync(avif1x)) fs.unlinkSync(avif1x);
            }
          }
        }

        console.log(`${highlight.BgCyan}delete${highlight.Reset} ${file}`);
        continue;
      }

      /* file info.
      -------------------------------------------------- */
      const fileinfo = {};
      const sizeinfo = sizeOf(file);
      fileinfo.filePath = file; // 元ファイルのURL
      fileinfo.fileLabel = path.basename(file, path.extname(file)); // ファイル名を取得
      fileinfo.fileExtension = sizeinfo.type; // ファイルの拡張子を取得
      fileinfo.width = sizeinfo.width; // 画像の幅
      fileinfo.height = sizeinfo.height; // 画像の高さ

      // Windows対応: パスの正規化とディレクトリの取得
      const normalizedFile = path.normalize(file);
      const normalizedInputDir = path.normalize(config.inputImageDir);
      const relativePath = path.relative(normalizedInputDir, path.dirname(normalizedFile));

      // Windows対応: バックスラッシュをスラッシュに変換（URLパス用）
      fileinfo.fileDir = relativePath === '.' ? '' : '' + relativePath.replace(/\\/g, '/');

      fileinfo.fileName = `${fileinfo.fileLabel}.${fileinfo.fileExtension}`; // ファイル名と拡張子を結合
      fileinfo.resolutionScaling = fileinfo.fileLabel.includes('@3x') ? '@3x' : fileinfo.fileLabel.includes('@2x') ? '@2x' : '';
      fileinfo.publishDir = path.join(config.outputImageDir, relativePath); // 出力先のディレクトリ（Windows対応）

      //
      const processID = `[${progress}/${imgLength}]`;
      const processLabel = `${fileinfo.fileName}`;
      const addLabel = argv.length > 0 ? 'add' : '';
      const animation = animateProcessing(processID, processLabel, addLabel);

      try {
        // 出力先のディレクトリを作成
        await fse.ensureDir(fileinfo.publishDir);
        // 画像の圧縮
        const log = await imageCompress(config, fileinfo);
        //
        clearInterval(animation);
        readline.cursorTo(process.stdout, addLabel.length + 1 + processID.length + processLabel.length + 1);
        console.log(`${log.join(',')}`);
        //
        progress++;
        result.push(fileinfo);
      } catch (error) {
        clearInterval(animation);
        readline.cursorTo(process.stdout, addLabel.length + 1 + processID.length + processLabel.length + 1);
        console.error(`Error: ${error.message}`);
      }
    }
    //
    return result;
  } catch (error) {
    console.error(`[imageOptimize] ${error}`);
    process.exit(1);
  }
};
