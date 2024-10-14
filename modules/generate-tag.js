/* eslint-disable no-undef */
/* ----------------------------------------------------------------
 * generate tag
-----------------------------------------------------------------*/
export const generateTag = async (config, fileList) => {
  try {
    const result = [];
    const options = config.snippetsOption;
    options.WebP = config.WebP;
    options.Avif = config.Avif;
    options.resolutionScaling = config.resolutionScaling;

    //
    for (const file of fileList) {
      // 画像のパスを設定
      file.path = options.path;

      // options.resolutionScalingがfalseの場合、resolutionScalingを空にする
      if (!options.resolutionScaling) file.resolutionScaling = '';

      // SP用画像は除外
      if (checkForInclude(file.fileLabel, options.responsiveSuffix.sp)) continue;

      const isResponsive = file.fileLabel.includes(options.responsiveSuffix.pc);
      const spFile = isResponsive ? findSpFile(file, fileList, options) : null;
      if (spFile) {
        spFile.path = options.path;
        if (!options.resolutionScaling) spFile.resolutionScaling = '';
      }

      //
      const tag = createImageTag(file, spFile, options);
      result.push({
        name: file.fileName,
        code: tag,
      });
    }
    return result;
  } catch (error) {
    console.error(`[generateTag] ${error}`);
    process.exit(1);
  }
};

/* ----------------------------------------------------------------
 * sp check.
-----------------------------------------------------------------*/
function checkForInclude(str, suffix) {
  // @で始まり、数字で終わる部分を抽出するための正規表現
  const suffixRegex = /@\d+x$/;
  // 文字列の最後に@数字xがある場合、それを除去
  const strToCheck = str.replace(suffixRegex, '');
  // _spで終わっているかチェック
  return strToCheck.endsWith(suffix);
}

/* ----------------------------------------------------------------
 * get search term.
-----------------------------------------------------------------*/
function getSearchTerm(input, fromStr, toStr) {
  // 最後の@より前の部分を取得
  const beforeLastAt = input.split('@').slice(0, -1).join('@');
  // fromStrをtoStrに置換するための正規表現を動的に作成
  const regex = new RegExp(`(.*)${fromStr}`, 'g');
  // 最後のfromStrをtoStrに置換
  return beforeLastAt.replace(regex, `$1${toStr}`);
}

/* ----------------------------------------------------------------
 * fileListからSP用画像の情報を取得
-----------------------------------------------------------------*/
function findSpFile(pcFile, fileList, options) {
  const searchTerm = getSearchTerm(pcFile.fileLabel, options.responsiveSuffix.pc, options.responsiveSuffix.sp);
  return fileList.find((item) => item.fileLabel.startsWith(searchTerm));
}

/* ----------------------------------------------------------------
 * 画像タグを生成
-----------------------------------------------------------------*/
function createImageTag(file, spFile, options) {
  const { WebP, Avif, breakpoint } = options;
  const mediaQuery = `(max-width: ${breakpoint - 0.02}px)`;
  const sources = [];

  //
  if (file.fileExtension !== 'svg') {
    if (spFile) {
      if (Avif) sources.push(...createSourceTags(file, spFile, 'avif', mediaQuery));
      if (WebP) sources.push(...createSourceTags(file, spFile, 'webp', mediaQuery));
      sources.push(...createSourceTags(file, spFile, file.fileExtension, mediaQuery));
    } else {
      if (Avif) sources.push(createSourceTag(file, 'avif'));
      if (WebP) sources.push(createSourceTag(file, 'webp'));
    }
  }

  //
  const img = createImgTag(file, options);
  return sources.length > 0 ? `<picture>\n${sources.join('\n')}\n  ${img}\n</picture>` : img;
}

/* ----------------------------------------------------------------
 * create source tags.
-----------------------------------------------------------------*/
function createSourceTags(pcFile, spFile, format, mediaQuery) {
  return [createSourceTag(spFile, format, mediaQuery), createSourceTag(pcFile, format)].filter(Boolean);
}

/* ----------------------------------------------------------------
 * create <source>.
-----------------------------------------------------------------*/
function createSourceTag(file, format, mediaQuery = '') {
  if (!file) return '';
  const srcset = createSrcset(file, format);
  const type = format !== file.fileExtension ? ` type="image/${format}"` : '';
  const media = mediaQuery ? ` media="${mediaQuery}"` : '';
  return type === '' && media === '' ? '' : `  <source${media} srcset="${srcset}"${type} width="${file.width}" height="${file.height}">`;
}

/* ----------------------------------------------------------------
 * create srcset.
-----------------------------------------------------------------*/
function createSrcset(file, format) {
  const basePath = `${file.path}${file.fileDir}/${file.fileName.replace(file.fileExtension, format)}`;

  if (!file.resolutionScaling) return basePath;

  const maxScale = parseInt(file.resolutionScaling.replace('@', ''));
  return Array.from({ length: maxScale }, (_, i) => i + 1)
    .map((scale) => `${basePath.replace(`@${maxScale}x`, `@${scale}x`)} ${scale}x`)
    .join(', ');
}

/* ----------------------------------------------------------------
 * <img>
-----------------------------------------------------------------*/
function createImgTag(file) {
  const src = file.resolutionScaling ? `${file.fileName.replace(file.resolutionScaling, '@1x')}` : `${file.fileName}`;
  const srcset = file.resolutionScaling ? ` srcset="${createSrcset(file, file.fileExtension)}"` : '';
  return `<img src="${file.path}${file.fileDir}/${src}"${srcset} alt="" width="${file.width}" height="${file.height}" decoding="async">`;
}
