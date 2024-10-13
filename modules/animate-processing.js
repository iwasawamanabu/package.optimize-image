import readline from 'readline';
//
import { highlight } from './console-highlight.js';
/* ----------------------------------------------------------------
 * processing animation.
-----------------------------------------------------------------*/
export const animateProcessing = (processID, processLabel, addLabel) => {
  const animationFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let frameIndex = 0;
  process.stdout.write(`${highlight.BgYellow}${addLabel}${highlight.Reset} ${highlight.FgBlack}${processID}${highlight.FgGreen}${processLabel}${highlight.Reset}…`);

  return setInterval(() => {
    readline.cursorTo(process.stdout, addLabel.length + 1 + processID.length + processLabel.length + 1);
    process.stdout.write(animationFrames[frameIndex]);
    frameIndex = (frameIndex + 1) % animationFrames.length;
  }, 100);
};
