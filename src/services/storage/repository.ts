import type { AppData } from '../../types';
import { BACKUP_KEY_PREFIX, CORRUPTED_KEY_PREFIX, MAX_AUTO_BACKUPS, STORAGE_KEY } from '../../constants';
import { createDefaultData, SchemaError, validateAppData, type ValidationReport } from './schema';

/** Subconjunto da Web Storage API, permitindo injetar um armazenamento em testes. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  key(index: number): string | null;
  readonly length: number;
}

export type LoadStatus = 'fresh' | 'loaded' | 'recovered' | 'corrupted';

export interface LoadResult {
  data: AppData;
  status: LoadStatus;
  report?: ValidationReport;
  message?: string;
}

export interface AutoBackupInfo {
  key: string;
  createdAt: string;
  reason: string;
}

export class MemoryStore implements KeyValueStore {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  getItem(k: string) {
    return this.map.has(k) ? (this.map.get(k) as string) : null;
  }
  setItem(k: string, v: string) {
    this.map.set(k, String(v));
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
  key(i: number) {
    return Array.from(this.map.keys())[i] ?? null;
  }
}

function defaultStore(): KeyValueStore {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const probe = '__fitstreak_probe__';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      return window.localStorage;
    }
  } catch {
    // Modo privado ou armazenamento bloqueado: continua em memória.
  }
  return new MemoryStore();
}

export class StorageRepository {
  constructor(private store: KeyValueStore = defaultStore()) {}

  get isPersistent(): boolean {
    return !(this.store instanceof MemoryStore);
  }

  load(): LoadResult {
    let raw: string | null;
    try {
      raw = this.store.getItem(STORAGE_KEY);
    } catch {
      return { data: createDefaultData(), status: 'corrupted', message: 'Não foi possível ler o armazenamento local.' };
    }
    if (raw === null) return { data: createDefaultData(), status: 'fresh' };

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return this.quarantine(raw, 'Os dados salvos estavam corrompidos (JSON inválido).');
    }
    try {
      const { data, report } = validateAppData(parsed);
      const issues = Object.keys(report.dropped).length > 0 || report.warnings.length > 0;
      if (issues) {
        // Guarda o original antes de salvar a versão sanitizada.
        this.writeBackup(raw, 'Antes da recuperação automática de dados');
        this.save(data);
        return { data, status: 'recovered', report, message: 'Alguns registros inválidos foram ignorados.' };
      }
      return { data, status: 'loaded', report };
    } catch (e) {
      const msg = e instanceof SchemaError ? e.message : 'Os dados salvos são incompatíveis.';
      return this.quarantine(raw, msg);
    }
  }

  save(data: AppData): void {
    this.store.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  /** Cria um backup automático dos dados atuais (ex.: antes de importar). */
  backupCurrent(reason: string): AutoBackupInfo | null {
    const raw = this.store.getItem(STORAGE_KEY);
    if (raw === null) return null;
    return this.writeBackup(raw, reason);
  }

  listBackups(): AutoBackupInfo[] {
    const out: AutoBackupInfo[] = [];
    for (let i = 0; i < this.store.length; i++) {
      const key = this.store.key(i);
      if (!key || !key.startsWith(BACKUP_KEY_PREFIX)) continue;
      try {
        const env = JSON.parse(this.store.getItem(key) ?? '{}') as { createdAt?: string; reason?: string };
        out.push({ key, createdAt: env.createdAt ?? '', reason: env.reason ?? '' });
      } catch {
        out.push({ key, createdAt: '', reason: 'Backup ilegível' });
      }
    }
    return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  readBackup(key: string): string | null {
    if (!key.startsWith(BACKUP_KEY_PREFIX)) return null;
    const raw = this.store.getItem(key);
    if (!raw) return null;
    try {
      const env = JSON.parse(raw) as { payload?: string };
      return typeof env.payload === 'string' ? env.payload : null;
    } catch {
      return null;
    }
  }

  private writeBackup(payload: string, reason: string): AutoBackupInfo | null {
    const createdAt = new Date().toISOString();
    const key = `${BACKUP_KEY_PREFIX}${createdAt}`;
    try {
      this.store.setItem(key, JSON.stringify({ createdAt, reason, payload }));
    } catch {
      return null;
    }
    const all = this.listBackups();
    for (const old of all.slice(MAX_AUTO_BACKUPS)) this.store.removeItem(old.key);
    return { key, createdAt, reason };
  }

  private quarantine(raw: string, message: string): LoadResult {
    try {
      this.store.setItem(`${CORRUPTED_KEY_PREFIX}${new Date().toISOString()}`, raw);
    } catch {
      // Sem espaço: segue sem a cópia.
    }
    return {
      data: createDefaultData(),
      status: 'corrupted',
      message: `${message} Uma cópia do conteúdo original foi preservada e o app iniciou com dados vazios.`,
    };
  }
}
