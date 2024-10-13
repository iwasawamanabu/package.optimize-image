import { optimizeImages } from '../index.mjs';
(async () => {
  const result = await optimizeImages();
  if (result) {
    console.log(result);
  }
})();
