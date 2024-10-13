import { generateTag } from './generate-tag.js';
/* ----------------------------------------------------------------
 * generate snippets.
-----------------------------------------------------------------*/
export const generateSnippets = async (config, fileList) => {
  try {
    const tags = await generateTag(config, fileList);
    const html = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <title>Images Tag Snippets</title>
    <script>
    document.addEventListener('DOMContentLoaded', function () {
      var body_str = document.getElementsByTagName('body')[0].innerHTML;
      body_str = body_str.replaceAll("${config.snippetsOption.path}", "${config.snippetsOption.public}${config.snippetsOption.path}");
      document.getElementsByTagName('body')[0].innerHTML = body_str;
    });
    </script>
  </head>
  <body>
${tags.join('\n\n')}
  </body>
</html>`;
    return html;
  } catch (error) {
    console.error(`[generateSnippets] ${error}`);
    process.exit(1);
  }
};
