import chalk from 'chalk';
import { isInitialized } from '../workspace.js';
import { readPersona, writePersona, formatPersonaSummary, Persona } from '../persona.js';

interface PersonaSetOptions {
  name?: string;
  role?: string;
  description?: string;
  systemPrompt?: string;
  traits?: string;
}

export async function personaShowCommand(): Promise<void> {
  if (!isInitialized()) {
    console.error(chalk.red(`Workspace not initialized. Run ${chalk.bold('ops-genie init')} first.`));
    process.exit(1);
  }

  const persona = await readPersona();
  console.log(chalk.bold('\nActive Persona'));
  console.log(chalk.dim('─'.repeat(40)));
  console.log(formatPersonaSummary(persona));
  console.log(chalk.dim('─'.repeat(40)));
  console.log(chalk.dim('\nSystem prompt:'));
  console.log(persona.systemPrompt);
}

export async function personaSetCommand(options: PersonaSetOptions): Promise<void> {
  if (!isInitialized()) {
    console.error(chalk.red(`Workspace not initialized. Run ${chalk.bold('ops-genie init')} first.`));
    process.exit(1);
  }

  const updates: Partial<Persona> = {};

  if (options.name) updates.name = options.name;
  if (options.role) updates.role = options.role;
  if (options.description) updates.description = options.description;
  if (options.systemPrompt) updates.systemPrompt = options.systemPrompt;
  if (options.traits) updates.traits = options.traits.split(',').map((t) => t.trim());

  if (Object.keys(updates).length === 0) {
    console.log(chalk.yellow('No persona fields specified. Use --name, --role, --description, --system-prompt, or --traits.'));
    return;
  }

  await writePersona(updates);
  console.log(chalk.green('Persona updated successfully.'));

  const persona = await readPersona();
  console.log('');
  console.log(formatPersonaSummary(persona));
}
