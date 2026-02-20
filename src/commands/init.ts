import chalk from 'chalk';
import ora from 'ora';
import { initWorkspace, isInitialized, WORKSPACE_DIR, WORKSPACE_PATHS } from '../workspace.js';
import { initPersona, readPersona, formatPersonaSummary } from '../persona.js';

export async function initCommand(): Promise<void> {
  const alreadyExists = isInitialized();

  if (alreadyExists) {
    console.log(chalk.yellow(`Workspace already exists at ${chalk.bold(WORKSPACE_DIR)}`));
    console.log(chalk.dim('Re-initializing will preserve existing config and persona.\n'));
  }

  const spinner = ora('Initializing ops-genie workspace...').start();

  try {
    await initWorkspace();
    await initPersona();

    spinner.succeed(chalk.green('Workspace initialized successfully'));
  } catch (err) {
    spinner.fail(chalk.red('Failed to initialize workspace'));
    throw err;
  }

  console.log('');
  console.log(chalk.bold('Workspace layout:'));
  console.log(`  ${chalk.cyan(WORKSPACE_PATHS.root)}`);
  console.log(`  ${chalk.dim('├─')} config.json   ${chalk.dim('# workspace settings')}`);
  console.log(`  ${chalk.dim('├─')} persona.json  ${chalk.dim('# assistant persona')}`);
  console.log(`  ${chalk.dim('├─')} history/      ${chalk.dim('# prompt history')}`);
  console.log(`  ${chalk.dim('└─')} logs/         ${chalk.dim('# execution logs')}`);
  console.log('');

  const persona = await readPersona();
  console.log(chalk.bold('Active persona:'));
  console.log(chalk.dim(formatPersonaSummary(persona)));
  console.log('');
  console.log(chalk.dim(`Run ${chalk.white('ops-genie prompt "<your question>"')} to get started.`));
}
