import fse from 'fs-extra';
import sharp from 'sharp';
import { optimize } from 'svgo';
//
import { highlight } from './console-highlight.js';
/* ----------------------------------------------------------------
 * 画像生成
-----------------------------------------------------------------*/
export const imageCompress = async (config, fileinfo) => {
  try {
    // log.
    const log = [];
    const ts_worker_start = Date.now();
    // svg
    if (fileinfo.fileExtension === 'svg') {
      if (config.SVG === true) {
        let binaryData = fse.readFileSync(fileinfo.filePath);
        binaryData = optimize(binaryData, config.svgoConfig);
        binaryData = binaryData.data;
        await fse.outputFile(`${fileinfo.publishDir}/${fileinfo.fileName}`, binaryData);

        // 画像の圧縮前と圧縮後の容量取得
        const svgStatBefore = await fse.stat(fileinfo.filePath);
        const svgStatAfter = await fse.stat(`${fileinfo.publishDir}/${fileinfo.fileName}`);
        log.push(`${highlight.Reset} ${svgStatBefore.size / 1000}KB → ${svgStatAfter.size / 1000}KB(${highlight.FgYellow}${100 - Math.ceil((svgStatAfter.size / svgStatBefore.size) * 100)}%↓)${highlight.Reset}`);
      } else {
        await fse.copy(fileinfo.filePath, `${fileinfo.publishDir}/${fileinfo.fileName}`);
        log.push(`${highlight.Reset}コピーしました。${highlight.Reset}`);
      }
    }
    // svg以外
    else {
      const publishFile = `${fileinfo.publishDir}/${fileinfo.fileName}`;
      // encoder と encodeOptions を指定して最適化 // SRGBではないときにMetadataを追加する
      await sharp(fileinfo.filePath).withMetadata().toFormat(fileinfo.fileExtension, config.encoderOptions[fileinfo.fileExtension]).toFile(publishFile);

      // 画像の圧縮前と圧縮後の容量取得
      const imageStatBefore = await fse.stat(fileinfo.filePath);
      const imageStatAfter = await fse.stat(`${fileinfo.publishDir}/${fileinfo.fileName}`);
      log.push(`${highlight.Reset} ${imageStatBefore.size / 1000}KB → ${imageStatAfter.size / 1000}KB${highlight.FgYellow}(${100 - Math.ceil((imageStatAfter.size / imageStatBefore.size) * 100)}%↓)${highlight.Reset}`);

      // @3x→@2x(1/1.5),@1x(1/3)の画像を生成
      if (config.resolutionScaling && fileinfo.resolutionScaling === '@3x') {
        // @2x
        await sharp(fileinfo.filePath)
          .resize({ width: Math.round(fileinfo.width / 1.5) })
          .withMetadata()
          .toFormat(fileinfo.fileExtension, config.encoderOptions[fileinfo.fileExtension])
          .toFile(publishFile.replace('@3x', '@2x'));
        // @1x
        await sharp(fileinfo.filePath)
          .resize({ width: Math.round(fileinfo.width / 3) })
          .withMetadata()
          .toFormat(fileinfo.fileExtension, config.encoderOptions[fileinfo.fileExtension])
          .toFile(publishFile.replace('@3x', '@1x'));
      } else if (config.resolutionScaling && fileinfo.resolutionScaling === '@2x') {
        // @1x
        await sharp(fileinfo.filePath)
          .resize({ width: Math.round(fileinfo.width / 2) })
          .withMetadata()
          .toFormat(fileinfo.fileExtension, config.encoderOptions[fileinfo.fileExtension])
          .toFile(publishFile.replace('@2x', '@1x'));
      }

      // WebP
      if (config.WebP) {
        await sharp(fileinfo.filePath)
          .withMetadata()
          .webp(config.encoderOptions['webp'])
          .toFile(publishFile.replace(`.${fileinfo.fileExtension}`, '.webp'));

        const webpStatAfter = await fse.stat(publishFile.replace(`.${fileinfo.fileExtension}`, '.webp'));
        log.push(`${highlight.Reset}WebP:${webpStatAfter.size / 1000}KB${highlight.FgYellow}(${100 - Math.ceil((webpStatAfter.size / imageStatBefore.size) * 100)}%↓)${highlight.Reset}`);

        // @3x→@2x(1/1.5),@1x(1/3)の画像を生成
        if (config.resolutionScaling && fileinfo.resolutionScaling === '@3x') {
          // @2x
          await sharp(fileinfo.filePath)
            .resize({ width: Math.round(fileinfo.width / 1.5) })
            .withMetadata()
            .webp(config.encoderOptions['webp'])
            .toFile(publishFile.replace(`.${fileinfo.fileExtension}`, '.webp').replace('@3x', '@2x'));
          // @1x
          await sharp(fileinfo.filePath)
            .resize({ width: Math.round(fileinfo.width / 3) })
            .withMetadata()
            .webp(config.encoderOptions['webp'])
            .toFile(publishFile.replace(`.${fileinfo.fileExtension}`, '.webp').replace('@3x', '@1x'));
        } else if (config.resolutionScaling && fileinfo.resolutionScaling === '@2x') {
          // @1x
          await sharp(fileinfo.filePath)
            .resize({ width: Math.round(fileinfo.width / 2) })
            .withMetadata()
            .webp(config.encoderOptions['webp'])
            .toFile(publishFile.replace(`.${fileinfo.fileExtension}`, '.webp').replace('@2x', '@1x'));
        }
      }
      // Avif
      if (config.Avif) {
        await sharp(fileinfo.filePath)
          .withMetadata()
          .avif(config.encoderOptions['avif'])
          .toFile(publishFile.replace(`.${fileinfo.fileExtension}`, '.avif'));

        const avifStatAfter = await fse.stat(publishFile.replace(`.${fileinfo.fileExtension}`, '.avif'));
        log.push(`${highlight.Reset}Avif:${avifStatAfter.size / 1000}KB${highlight.FgYellow}(${100 - Math.ceil((avifStatAfter.size / imageStatBefore.size) * 100)}%↓)${highlight.Reset}`);

        // @3x→@2x(1/1.5),@1x(1/3)の画像を生成
        if (config.resolutionScaling && fileinfo.resolutionScaling === '@3x') {
          // @2x
          await sharp(fileinfo.filePath)
            .resize({ width: Math.round(fileinfo.width / 1.5) })
            .withMetadata()
            .avif(config.encoderOptions['avif'])
            .toFile(publishFile.replace(`.${fileinfo.fileExtension}`, '.avif').replace('@3x', '@2x'));
          // @1x
          await sharp(fileinfo.filePath)
            .resize({ width: Math.round(fileinfo.width / 3) })
            .withMetadata()
            .avif(config.encoderOptions['avif'])
            .toFile(publishFile.replace(`.${fileinfo.fileExtension}`, '.avif').replace('@3x', '@1x'));
        } else if (config.resolutionScaling && fileinfo.resolutionScaling === '@2x') {
          // @1x
          await sharp(fileinfo.filePath)
            .resize({ width: Math.round(fileinfo.width / 2) })
            .withMetadata()
            .avif(config.encoderOptions['avif'])
            .toFile(publishFile.replace(`.${fileinfo.fileExtension}`, '.avif').replace('@2x', '@1x'));
        }
      }
    }
    //
    const ts_worker_end = Date.now();
    log.push(`${highlight.FgYellow}${(ts_worker_end - ts_worker_start) / 1000}s${highlight.Reset}`);
    return log;
  } catch (error) {
    console.error(`[imageCompress] ${error}`);
    process.exit(1);
  }
};
