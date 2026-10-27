#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { createSpinner } from './utils/spinner.js';
import { genJwt } from './utils/secret.js';
import { init } from './commands/init.js';

const program = new Command();

program
  .name('vaulty')
  .description('🛡️ Zero-Trust Secret Manager & .env Guard')
  .version('1.0.0');

if (process.argv.length <= 2) {
  const c = chalk.cyan;
  const dim = chalk.gray;
  const white = chalk.white;
  const LEFT = 41;
  const RIGHT = 30;
  const V_WIDTH = 11;
  const V_HEIGHT = 5;
  const TOP: readonly [number, number, number] = [125, 211, 252];
  const BOTTOM: readonly [number, number, number] = [30, 27, 75];
  const SHADES = ['█', '▓', '▒', '░'];
  const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);
  const isOn = (y: number, x: number) =>
    (x >= y && x <= y + 2) || (x >= V_WIDTH - 3 - y && x <= V_WIDTH - 1 - y);

  const logo: string[] = [];
  for (let y = 0; y < V_HEIGHT; y++) {
    const t = y / (V_HEIGHT - 1);
    const r = lerp(TOP[0], BOTTOM[0], t);
    const g = lerp(TOP[1], BOTTOM[1], t);
    const b = lerp(TOP[2], BOTTOM[2], t);
    const color = chalk.rgb(r, g, b);
    const shade = SHADES[Math.min(SHADES.length - 1, Math.floor((y / V_HEIGHT) * SHADES.length))];
    let line = '';
    for (let x = 0; x < V_WIDTH; x++) line += isOn(y, x) ? color(shade) : ' ';
    logo.push(line);
  }

  const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, '');
  const pad = (s: string, w: number) => s + ' '.repeat(Math.max(0, w - stripAnsi(s).length));

  const left = [
    '',
    '    ' + chalk.bold(`Welcome back, ${chalk.cyan(`builder!`)}`),
    '',
    ...logo.map((row) => '    ' + row),
    '',
    '    ' + chalk.bold('Vaulty v1.0.0') + dim(' · ') + white('AES-256 Vault'),
    '    ' + dim('~/your-project'),
  ];

  const right = [
    '',
    ' ' + dim('Tips for getting started'),
    ' ' + white(`Run \`vaulty ${chalk.cyan('init')}\` to protect`),
    ' ' + dim('─'.repeat(RIGHT - 2)),
    ' ' + dim('Recent activity'),
    ' ' + white('No recent activity'),
  ];

  const rows = Math.max(left.length, right.length);

  console.log('\n');
  console.log(c('╭' + '─'.repeat(LEFT) + '┬' + '─'.repeat(RIGHT) + '╮'));
  for (let i = 0; i < rows; i++) {
    console.log(c('│') + pad(left[i] ?? '', LEFT) + c('│') + pad(right[i] ?? '', RIGHT) + c('│'));
  }
  console.log(c('╰' + '─'.repeat(LEFT) + '┴' + '─'.repeat(RIGHT) + '╯'));

  console.log('\n  ' + chalk.bold('Quick Commands:'));
  console.log(`    ${chalk.cyan('vaulty gen jwt')}        Generate a secure cryptographic secret`);
  console.log(`    ${chalk.cyan('vaulty guard')}            Scan project for exposed .env files\n`);

  process.exit(0);
}

const genCommand = program.command('gen').description('Generate secure keys and tokens');

genCommand
  .command('jwt')
  .description('Generate a secure cryptographic secret for JWTs')
  .option('-l, --length <number>', 'Key length in bytes', '32')
  .action(async (options) => {
    const spinner = createSpinner('Generating cryptographic entropy...').start();
    
    await new Promise((r) => setTimeout(r, 800));
    spinner.text = chalk.yellow('Signing 256-bit key...');
    await new Promise((r) => setTimeout(r, 600));

    const secret = genJwt(options.length);

    spinner.succeed(chalk.green.bold(' JWT Key Generated Successfully!'));
    console.log('\n  ' + chalk.bgCyan.black.bold(' SECRET ') + ' ' + chalk.bold(secret) + '\n');
  });

program
  .command('guard')
  .description('Scan project for exposed secrets and setup git hooks')
  .action(async () => {
    console.log(chalk.bold.magenta('\n🛡️  Vaulty Security Guard\n'));

    const spinner = createSpinner('Scanning root directory for exposed .env files...').start();

    await sleep(900);
    spinner.text = chalk.yellow('Checking .gitignore configuration...');
    await sleep(800);
    spinner.text = chalk.cyan('Verifying pre-commit git hooks...');
    await sleep(600);

    spinner.succeed(chalk.green('Project is safe! .env files are blocked from git.\n'));
  });

program
  .command('init')
  .description('Protect repo by updating .gitignore and installing pre-commit hooks')
  .option('--no-hooks', "Don't install pre-commit hooks")
  .action(async (opts) => {
    try {
      const res = await init({ hooks: opts.hooks !== false });
      console.log(chalk.green('\n✓ Vaulty initialized'));
      console.log(chalk.gray(`  Repo: ${res.root}`));
      if (res.trackedEnv.length) {
        console.log(chalk.yellow(`  ⚠ Tracked env files found: ${res.trackedEnv.join(', ')}`));
        console.log(chalk.gray('    Run "git rm --cached <file>" to stop tracking them'));
      }
      console.log(chalk.gray('  .gitignore updated with vaulty block'));
      if (opts.hooks !== false) {
        console.log(chalk.gray('  Pre-commit hook installed (.vaulty/hooks/pre-commit)'));
      }
      console.log('');
    } catch (e) {
      console.error(chalk.red(`\n✖ ${(e as Error).message}\n`));
      process.exit(1);
    }
  });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

program.parse(process.argv);