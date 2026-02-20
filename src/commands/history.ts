import chalk from 'chalk';
import { isInitialized, readHistory } from '../workspace.js';

interface HistoryOptions {
  limit?: number;
}

export async function historyCommand(options: HistoryOptions): Promise<void> {
  if (!isInitialized()) {
    console.error(chalk.red(`Workspace not initialized. Run ${chalk.bold('ops-genie init')} first.`));
    process.exit(1);
  }

  const limit = options.limit ?? 10;
  const entries = await readHistory(limit);

  if (entries.length === 0) {
    console.log(chalk.dim('No prompt history yet.'));
    return;
  }

  console.log(chalk.bold(`\nPrompt History (last ${entries.length})`));
  console.log(chalk.dim('─'.repeat(60)));

  for (const entry of entries) {
    const ts = new Date(entry.timestamp).toLocaleString();
    console.log(chalk.dim(ts));
    console.log(chalk.cyan('> ') + entry.input);
    const preview = entry.output.slice(0, 200).replace(/\n/g, ' ');
    const truncated = entry.output.length > 200;
    console.log(chalk.white(preview) + (truncated ? chalk.dim('...') : ''));
    console.log('');
  }
}
