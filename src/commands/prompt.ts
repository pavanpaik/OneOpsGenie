import { spawn } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import { isInitialized, readConfig, appendHistory } from '../workspace.js';
import { readPersona } from '../persona.js';

interface PromptOptions {
  model?: string;
  noHistory?: boolean;
  verbose?: boolean;
}

/**
 * Build the full system prompt from the active persona, prepending it to the
 * user's message so Claude receives persona context every call.
 */
async function buildSystemPrompt(): Promise<string> {
  const persona = await readPersona();
  return persona.systemPrompt;
}

/**
 * Invoke the locally installed `claude` CLI with the `-p` flag (print / non-interactive mode).
 * Streams stdout/stderr back to the terminal and captures the full response for history.
 */
function invokeClaudeCli(
  claudePath: string,
  userMessage: string,
  systemPrompt: string,
  model?: string,
  verbose?: boolean,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const args: string[] = [
      '-p', userMessage,
      '--system-prompt', systemPrompt,
    ];

    if (model) {
      args.push('--model', model);
    }

    if (verbose) {
      console.log(chalk.dim(`[debug] ${claudePath} ${args.map((a) => JSON.stringify(a)).join(' ')}`));
    }

    const child = spawn(claudePath, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    child.stdout.on('data', (chunk: Buffer) => {
      process.stdout.write(chunk);
      stdoutChunks.push(chunk);
    });

    child.stderr.on('data', (chunk: Buffer) => {
      process.stderr.write(chunk);
      stderrChunks.push(chunk);
    });

    child.on('error', (err) => {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        reject(
          new Error(
            `'${claudePath}' not found. Install the Claude CLI first:\n  npm install -g @anthropic-ai/claude-code`,
          ),
        );
      } else {
        reject(err);
      }
    });

    child.on('close', (code) => {
      const output = Buffer.concat(stdoutChunks).toString('utf8');
      if (code !== 0) {
        const errOutput = Buffer.concat(stderrChunks).toString('utf8');
        reject(new Error(`claude exited with code ${code}: ${errOutput}`));
      } else {
        resolve(output);
      }
    });
  });
}

export async function promptCommand(userMessage: string, options: PromptOptions): Promise<void> {
  if (!isInitialized()) {
    console.error(chalk.red(`Workspace not initialized. Run ${chalk.bold('ops-genie init')} first.`));
    process.exit(1);
  }

  const config = await readConfig();
  const claudePath = options.model
    ? (config.claudePath ?? 'claude')
    : (config.claudePath ?? 'claude');

  const model = options.model ?? config.defaultModel;

  const spinner = ora({ text: 'Thinking...', color: 'cyan' }).start();

  let systemPrompt: string;
  try {
    systemPrompt = await buildSystemPrompt();
  } catch (err) {
    spinner.fail(chalk.red('Failed to load persona'));
    throw err;
  }

  spinner.stop();
  console.log(chalk.bold.cyan('\nOpsGenie'));
  console.log(chalk.dim('─'.repeat(40)));

  let output = '';
  try {
    output = await invokeClaudeCli(claudePath, userMessage, systemPrompt, model, options.verbose);
  } catch (err) {
    console.error(chalk.red('\nError:'), (err as Error).message);
    process.exit(1);
  }

  console.log(chalk.dim('─'.repeat(40)));

  if (!options.noHistory) {
    try {
      await appendHistory({
        command: 'prompt',
        input: userMessage,
        output: output.trim(),
        timestamp: new Date().toISOString(),
      });
    } catch {
      // History write failure is non-fatal
    }
  }
}
