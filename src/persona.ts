import fs from 'fs-extra';
import { WORKSPACE_PATHS, isInitialized } from './workspace.js';

export interface Persona {
  name: string;
  role: string;
  description: string;
  systemPrompt: string;
  traits: string[];
  updatedAt: string;
}

const DEFAULT_PERSONA: Persona = {
  name: 'OpsGenie',
  role: 'Operations Assistant',
  description:
    'A knowledgeable operations assistant that helps with infrastructure, automation, and DevOps tasks.',
  systemPrompt:
    'You are OpsGenie, an expert operations assistant. You help with infrastructure management, automation, DevOps workflows, and system administration. You are concise, technical, and practical. You remember context from previous interactions in this workspace.',
  traits: ['technical', 'concise', 'practical', 'reliable'],
  updatedAt: new Date().toISOString(),
};

export async function readPersona(): Promise<Persona> {
  if (!isInitialized()) {
    throw new Error(`Workspace not initialized. Run 'ops-genie init' first.`);
  }

  if (!fs.existsSync(WORKSPACE_PATHS.persona)) {
    return DEFAULT_PERSONA;
  }

  return fs.readJson(WORKSPACE_PATHS.persona) as Promise<Persona>;
}

export async function writePersona(persona: Partial<Persona>): Promise<void> {
  if (!isInitialized()) {
    throw new Error(`Workspace not initialized. Run 'ops-genie init' first.`);
  }

  let current: Persona;
  if (fs.existsSync(WORKSPACE_PATHS.persona)) {
    current = (await fs.readJson(WORKSPACE_PATHS.persona)) as Persona;
  } else {
    current = DEFAULT_PERSONA;
  }

  const updated: Persona = {
    ...current,
    ...persona,
    updatedAt: new Date().toISOString(),
  };

  await fs.writeJson(WORKSPACE_PATHS.persona, updated, { spaces: 2 });
}

export async function initPersona(): Promise<void> {
  if (!fs.existsSync(WORKSPACE_PATHS.persona)) {
    await fs.writeJson(WORKSPACE_PATHS.persona, DEFAULT_PERSONA, { spaces: 2 });
  }
}

export function formatPersonaSummary(persona: Persona): string {
  return [
    `Name:        ${persona.name}`,
    `Role:        ${persona.role}`,
    `Description: ${persona.description}`,
    `Traits:      ${persona.traits.join(', ')}`,
    `Updated:     ${persona.updatedAt}`,
  ].join('\n');
}
