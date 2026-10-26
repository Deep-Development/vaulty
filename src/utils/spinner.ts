import ora from 'ora';
import chalk from 'chalk';

export const brailleSpinner = {
  interval: 80,
  frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
};

export function createSpinner(text: string) {
  return ora({
    text: chalk.cyan(text),
    spinner: brailleSpinner,
  });
}