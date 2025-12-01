/**
 * Classe genérica de cache com TTL (Time To Live)
 * Permite armazenar valores com expiração automática
 */

export interface CacheEntry<V> {
  timestamp: number;
  value: V;
}

export class TTLCache<K, V> {
  private cache = new Map<K, CacheEntry<V>>();

  /**
   * @param ttl - Tempo de vida em milissegundos
   * @param maxSize - Tamanho máximo do cache (default: 100)
   */
  constructor(
    private ttl: number,
    private maxSize: number = 100
  ) {}

  /**
   * Obtém um valor do cache
   * @param key - Chave do valor
   * @returns Valor ou undefined se não existir ou expirou
   */
  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    // Verificar se expirou
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Armazena um valor no cache
   * @param key - Chave do valor
   * @param value - Valor a ser armazenado
   */
  set(key: K, value: V): void {
    // Se atingiu o tamanho máximo, fazer limpeza
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    // Se ainda está cheio após limpeza, remover o mais antigo
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      timestamp: Date.now(),
      value,
    });
  }

  /**
   * Verifica se o cache tem uma chave válida
   * @param key - Chave a verificar
   * @returns true se existe e não expirou
   */
  has(key: K): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove uma chave do cache
   * @param key - Chave a remover
   * @returns true se foi removida
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove entradas expiradas
   * @returns Número de entradas removidas
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Retorna o tamanho atual do cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Verifica se uma entrada expirou
   * @private
   */
  private isExpired(entry: CacheEntry<V>): boolean {
    return Date.now() - entry.timestamp > this.ttl;
  }

  /**
   * Obtém todas as chaves do cache (apenas não expiradas)
   */
  keys(): K[] {
    const keys: K[] = [];
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isExpired(entry)) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Obtém todos os valores do cache (apenas não expirados)
   */
  values(): V[] {
    const values: V[] = [];
    for (const [, entry] of this.cache.entries()) {
      if (!this.isExpired(entry)) {
        values.push(entry.value);
      }
    }
    return values;
  }

  /**
   * Obtém todas as entradas do cache (apenas não expiradas)
   */
  entries(): Array<[K, V]> {
    const entries: Array<[K, V]> = [];
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isExpired(entry)) {
        entries.push([key, entry.value]);
      }
    }
    return entries;
  }
}
