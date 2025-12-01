import { Graph, LayoutCache } from '@/src/types/graph.types';
import { Note } from '@/src/types/note.types';

/**
 * Cache de layouts de grafo
 */
class GraphLayoutCache {
  private cache: LayoutCache | null = null;
  private readonly TTL = 10000; // 10 segundos

  /**
   * Gera hash das notas para invalidação de cache
   */
  private generateNotesHash(notes: Note[]): string {
    // Hash simples baseado em IDs e updatedAt
    const data = notes
      .map((n) => `${n.id}-${n.updatedAt}`)
      .sort()
      .join('|');

    return this.simpleHash(data);
  }

  /**
   * Hash simples (não criptográfico)
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Obtém layout do cache se válido
   */
  get(notes: Note[]): Graph | null {
    if (!this.cache) return null;

    const hash = this.generateNotesHash(notes);
    const age = Date.now() - this.cache.timestamp;

    // Invalidar se hash mudou ou TTL expirou
    if (this.cache.notesHash !== hash || age > this.TTL) {
      this.cache = null;
      return null;
    }

    return this.cache.graph;
  }

  /**
   * Armazena layout no cache
   */
  set(notes: Note[], graph: Graph): void {
    this.cache = {
      notesHash: this.generateNotesHash(notes),
      graph,
      timestamp: Date.now(),
    };
  }

  /**
   * Limpa cache
   */
  clear(): void {
    this.cache = null;
  }

  /**
   * Verifica se cache está válido
   */
  isValid(notes: Note[]): boolean {
    if (!this.cache) return false;

    const hash = this.generateNotesHash(notes);
    const age = Date.now() - this.cache.timestamp;

    return this.cache.notesHash === hash && age <= this.TTL;
  }
}

/**
 * Instância global do cache
 */
export const graphLayoutCache = new GraphLayoutCache();
