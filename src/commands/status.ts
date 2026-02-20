import chalk from 'chalk';
import fs from 'fs-extra';
import { isInitialized, readConfig, readHistory, WORKSPACE_PATHS, WORKSPACE_DIR } from '../workspace.js';
import { readPersona } from '../persona.js';

export async function statusCommand(): Promise<void> {
  console.log(chalk.bold('\nops-genie workspace status'));
  console.log(chalk.dim('─'.repeat(40)));

  if (!isInitialized()) {
    console.log(chalk.yellow('Status:') + ' Not initialized');
    console.log(chalk.dim(`\nRun ${chalk.white('ops-genie init')} to set up your workspace.`));
    return;
  }

  const config = await readConfig();
  const persona = await readPersona();
  const historyEntries = await readHistory(1000);

  // Count history files
  const historyFiles = await fs.readdir(WORKSPACE_PATHS.history);

  console.log(`${chalk.bold('Status:')}        ${chalk.green('Initialized')}`);
  console.log(`${chalk.bold('Workspace:')}     ${WORKSPACE_DIR}`);
  console.log(`${chalk.bold('Version:')}       ${config.version}`);
  console.log(`${chalk.bold('Created:')}       ${new Date(config.createdAt).toLocaleString()}`);
  console.log(`${chalk.bold('Claude path:')}   ${config.claudePath ?? 'claude'}`);
  console.log('');
  console.log(`${chalk.bold('Persona:')}       ${persona.name} (${persona.role})`);
  console.log(`${chalk.bold('Traits:')}        ${persona.traits.join(', ')}`);
  console.log('');
  console.log(`${chalk.bold('History:')}       ${historyFiles.filter((f) => f.endsWith('.json')).length} prompt(s) recorded`);

  if (historyEntries.length > 0) {
    const last = historyEntries[0];
    console.log(`${chalk.bold('Last prompt:')}   ${new Date(last.timestamp).toLocaleString()}`);
    console.log(chalk.dim(`  "${last.input.slice(0, 60)}${last.input.length > 60 ? '...' : ''}"`));
  }

  console.log(chalk.dim('─'.repeat(40)));
}
