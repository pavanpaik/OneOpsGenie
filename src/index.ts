#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { promptCommand } from './commands/prompt.js';
import { personaShowCommand, personaSetCommand } from './commands/persona.js';
import { historyCommand } from './commands/history.js';
import { statusCommand } from './commands/status.js';

const program = new Command();

program
  .name('ops-genie')
  .description('An operations assistant CLI that delegates prompts to Claude')
  .version('0.1.0');

// ── init ────────────────────────────────────────────────────────────────────
program
  .command('init')
  .description('Initialize the ops-genie workspace at ~/.ops-genie')
  .action(async () => {
    try {
      await initCommand();
    } catch (err) {
      console.error((err as Error).message);
      process.exit(1);
    }
  });

// ── prompt ───────────────────────────────────────────────────────────────────
program
  .command('prompt <message>')
  .description('Send a prompt to Claude via the local claude CLI (-p mode)')
  .option('-m, --model <model>', 'Override the Claude model to use')
  .option('--no-history', 'Do not save this prompt to history')
  .option('-v, --verbose', 'Print the claude invocation for debugging')
  .action(async (message: string, options: { model?: string; history: boolean; verbose?: boolean }) => {
    try {
      await promptCommand(message, {
        model: options.model,
        noHistory: !options.history,
        verbose: options.verbose,
      });
    } catch (err) {
      console.error((err as Error).message);
      process.exit(1);
    }
  });

// ── persona ──────────────────────────────────────────────────────────────────
const personaCmd = program
  .command('persona')
  .description('View or configure the assistant persona');

personaCmd
  .command('show')
  .description('Show the current persona')
  .action(async () => {
    try {
      await personaShowCommand();
    } catch (err) {
      console.error((err as Error).message);
      process.exit(1);
    }
  });

personaCmd
  .command('set')
  .description('Update persona fields')
  .option('--name <name>', 'Persona name')
  .option('--role <role>', 'Persona role/title')
  .option('--description <description>', 'Persona description')
  .option('--system-prompt <prompt>', 'System prompt injected with every request')
  .option('--traits <traits>', 'Comma-separated list of traits')
  .action(async (options: {
    name?: string;
    role?: string;
    description?: string;
    systemPrompt?: string;
    traits?: string;
  }) => {
    try {
      await personaSetCommand(options);
    } catch (err) {
      console.error((err as Error).message);
      process.exit(1);
    }
  });

// Make `ops-genie persona` (with no subcommand) default to `show`
personaCmd.action(async () => {
  try {
    await personaShowCommand();
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
});

// ── history ──────────────────────────────────────────────────────────────────
program
  .command('history')
  .description('Show recent prompt history')
  .option('-n, --limit <number>', 'Number of entries to show', '10')
  .action(async (options: { limit: string }) => {
    try {
      await historyCommand({ limit: parseInt(options.limit, 10) });
    } catch (err) {
      console.error((err as Error).message);
      process.exit(1);
    }
  });

// ── status ───────────────────────────────────────────────────────────────────
program
  .command('status')
  .description('Show workspace status')
  .action(async () => {
    try {
      await statusCommand();
    } catch (err) {
      console.error((err as Error).message);
      process.exit(1);
    }
  });

program.parse(process.argv);
