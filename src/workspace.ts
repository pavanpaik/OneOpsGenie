import fs from 'fs-extra';
import path from 'path';
import os from 'os';

export const WORKSPACE_DIR = path.join(os.homedir(), '.ops-genie');

export const WORKSPACE_PATHS = {
  root: WORKSPACE_DIR,
  config: path.join(WORKSPACE_DIR, 'config.json'),
  history: path.join(WORKSPACE_DIR, 'history'),
  logs: path.join(WORKSPACE_DIR, 'logs'),
  persona: path.join(WORKSPACE_DIR, 'persona.json'),
};

export interface WorkspaceConfig {
  version: string;
  createdAt: string;
  updatedAt: string;
  defaultModel?: string;
  claudePath?: string;
}

const DEFAULT_CONFIG: WorkspaceConfig = {
  version: '0.1.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  defaultModel: 'claude',
  claudePath: 'claude',
};

export function isInitialized(): boolean {
  return fs.existsSync(WORKSPACE_PATHS.config);
}

export async function initWorkspace(): Promise<void> {
  await fs.ensureDir(WORKSPACE_PATHS.root);
  await fs.ensureDir(WORKSPACE_PATHS.history);
  await fs.ensureDir(WORKSPACE_PATHS.logs);

  if (!fs.existsSync(WORKSPACE_PATHS.config)) {
    await fs.writeJson(WORKSPACE_PATHS.config, DEFAULT_CONFIG, { spaces: 2 });
  }
}

export async function readConfig(): Promise<WorkspaceConfig> {
  if (!isInitialized()) {
    throw new Error(`Workspace not initialized. Run 'ops-genie init' first.`);
  }
  return fs.readJson(WORKSPACE_PATHS.config) as Promise<WorkspaceConfig>;
}

export async function writeConfig(config: Partial<WorkspaceConfig>): Promise<void> {
  const current = await readConfig();
  const updated: WorkspaceConfig = {
    ...current,
    ...config,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeJson(WORKSPACE_PATHS.config, updated, { spaces: 2 });
}

export async function appendHistory(entry: {
  command: string;
  input: string;
  output: string;
  timestamp: string;
}): Promise<void> {
  const filename = `${entry.timestamp.replace(/[:.]/g, '-')}.json`;
  const filePath = path.join(WORKSPACE_PATHS.history, filename);
  await fs.writeJson(filePath, entry, { spaces: 2 });
}

export async function readHistory(limit = 20): Promise<Array<{
  command: string;
  input: string;
  output: string;
  timestamp: string;
}>> {
  const files = await fs.readdir(WORKSPACE_PATHS.history);
  const jsonFiles = files
    .filter((f) => f.endsWith('.json'))
    .sort()
    .reverse()
    .slice(0, limit);

  const entries = await Promise.all(
    jsonFiles.map((f) =>
      fs.readJson(path.join(WORKSPACE_PATHS.history, f))
    )
  );
  return entries as Array<{
    command: string;
    input: string;
    output: string;
    timestamp: string;
  }>;
}
