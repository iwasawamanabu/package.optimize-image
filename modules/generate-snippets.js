import { generateTag } from './generate-tag.js';
import { generateHTML } from './generate-html.js';
/* ----------------------------------------------------------------
 * generate snippets.
-----------------------------------------------------------------*/
export const generateSnippets = async (config, fileList) => {
  try {
    const tags = await generateTag(config, fileList);
    const html = await generateHTML(config, tags);
    return html;
  } catch (error) {
    console.error(`[generateSnippets] ${error}`);
    process.exit(1);
  }
};
