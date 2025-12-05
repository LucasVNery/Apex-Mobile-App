/**
 * Serviço de Sincronização
 *
 * Gerencia sincronização entre estado local (Zustand + AsyncStorage) e API
 * Padrão: Offline-First com sincronização automática
 */

import { api } from './index';
import type { Note } from '../types/note.types';
import type { ProgressionState } from '../types/progression.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Status de sincronização
 */
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

interface SyncState {
  status: SyncStatus;
  lastSync: number | null;
  error: string | null;
}

/**
 * Classe de sincronização
 */
class SyncService {
  private syncState: SyncState = {
    status: 'idle',
    lastSync: null,
    error: null,
  };

  private listeners: Array<(state: SyncState) => void> = [];

  /**
   * Subscreve para mudanças de status
   */
  subscribe(listener: (state: SyncState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notifica listeners
   */
  private notify() {
    this.listeners.forEach(listener => listener(this.syncState));
  }

  /**
   * Atualiza status de sincronização
   */
  private updateStatus(status: SyncStatus, error: string | null = null) {
    this.syncState = {
      status,
      lastSync: status === 'success' ? Date.now() : this.syncState.lastSync,
      error,
    };
    this.notify();
  }

  /**
   * Verifica se API está disponível
   */
  async isApiAvailable(): Promise<boolean> {
    try {
      // Tenta fazer uma requisição simples
      const response = await api.notes.getAll({ limit: 1 });
      return response.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sincroniza notas do local para a API
   */
  async syncNotesToApi(notes: Note[]): Promise<void> {
    this.updateStatus('syncing');

    try {
      // Marca no AsyncStorage quais notas já foram sincronizadas
      const syncedIds = await this.getSyncedNoteIds();

      for (const note of notes) {
        if (!syncedIds.includes(note.id)) {
          try {
            // Cria nota na API
            await api.notes.create({
              title: note.title,
              tags: note.tags,
              color: note.color,
              parentId: note.parentId,
              hierarchyOrder: note.hierarchyOrder,
            });

            // Cria blocos
            for (const block of note.blocks) {
              await api.blocks.create({
                noteId: note.id,
                type: block.type,
                content: (block as any).content || '',
                order: block.order,
                parentId: block.parentId,
              });
            }

            // Marca como sincronizada
            await this.markNoteAsSynced(note.id);
          } catch (error) {
            console.error(`Erro ao sincronizar nota ${note.id}:`, error);
          }
        }
      }

      this.updateStatus('success');
    } catch (error: any) {
      this.updateStatus('error', error.message);
      throw error;
    }
  }

  /**
   * Sincroniza notas da API para o local
   */
  async syncNotesFromApi(): Promise<Note[]> {
    this.updateStatus('syncing');

    try {
      const response = await api.notes.getAll();

      if (!response.success || !response.data) {
        throw new Error('Falha ao buscar notas da API');
      }

      const notes = response.data.items;
      this.updateStatus('success');
      return notes;
    } catch (error: any) {
      this.updateStatus('error', error.message);
      throw error;
    }
  }

  /**
   * Sincroniza progressão para a API
   */
  async syncProgressionToApi(progression: ProgressionState): Promise<void> {
    try {
      await api.progression.update({
        notesCreated: progression.notesCreated,
        linksCreated: progression.linksCreated,
        blocksUsed: progression.blocksUsed,
        tagsUsed: progression.tagsUsed,
        graphInteractions: progression.graphInteractions,
      });
    } catch (error) {
      console.error('Erro ao sincronizar progressão:', error);
    }
  }

  /**
   * Sincroniza progressão da API
   */
  async syncProgressionFromApi(): Promise<ProgressionState | null> {
    try {
      const response = await api.progression.get();
      return response.data || null;
    } catch (error) {
      console.error('Erro ao buscar progressão da API:', error);
      return null;
    }
  }

  /**
   * Busca IDs de notas já sincronizadas
   */
  private async getSyncedNoteIds(): Promise<string[]> {
    const stored = await AsyncStorage.getItem('synced-notes');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Marca nota como sincronizada
   */
  private async markNoteAsSynced(noteId: string): Promise<void> {
    const syncedIds = await this.getSyncedNoteIds();
    if (!syncedIds.includes(noteId)) {
      syncedIds.push(noteId);
      await AsyncStorage.setItem('synced-notes', JSON.stringify(syncedIds));
    }
  }

  /**
   * Limpa marcadores de sincronização
   */
  async clearSyncMarkers(): Promise<void> {
    await AsyncStorage.removeItem('synced-notes');
  }

  /**
   * Obtém status atual
   */
  getStatus(): SyncState {
    return this.syncState;
  }

  /**
   * Sincronização completa (notas + progressão)
   */
  async fullSync(notes: Note[], progression: ProgressionState): Promise<void> {
    this.updateStatus('syncing');

    try {
      const available = await this.isApiAvailable();

      if (!available) {
        throw new Error('API não disponível');
      }

      // Sincroniza notas
      await this.syncNotesToApi(notes);

      // Sincroniza progressão
      await this.syncProgressionToApi(progression);

      this.updateStatus('success');
    } catch (error: any) {
      this.updateStatus('error', error.message);
      throw error;
    }
  }
}

// Exporta instância singleton
export const syncService = new SyncService();

export default syncService;
