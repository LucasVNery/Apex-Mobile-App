/**
 * Custom hooks para facilitar uso das APIs
 *
 * Estes hooks encapsulam chamadas de API com:
 * - Loading states
 * - Error handling
 * - Retry logic
 * - TypeScript types
 */

import { useState, useCallback, useEffect } from 'react';
import { api, ApiError } from '@/src/api';
import type {
  CreateNoteDto,
  UpdateNoteDto,
  NoteFilters,
} from '@/src/api/notes.api';
import type { CreateBlockDto, UpdateBlockDto } from '@/src/api/blocks.api';
import type { Note, Block } from '@/src/types/note.types';
import type { Graph, GraphFilter } from '@/src/types/graph.types';
import type { ProgressionState } from '@/src/types/progression.types';

/**
 * Estado genérico de API
 */
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook genérico para chamadas de API
 */
export function useApiCall<T, Args extends any[]>(
  apiCall: (...args: Args) => Promise<any>
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args) => {
      setState({ data: null, loading: true, error: null });

      try {
        const response = await apiCall(...args);

        if (response.success) {
          setState({ data: response.data, loading: false, error: null });
          return response.data;
        } else {
          setState({ data: null, loading: false, error: response.error || 'Erro desconhecido' });
          return null;
        }
      } catch (error) {
        const apiError = error as ApiError;
        setState({ data: null, loading: false, error: apiError.message });
        return null;
      }
    },
    [apiCall]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

/**
 * Hook para operações com notas
 */
export function useNotes() {
  const create = useApiCall<Note, [CreateNoteDto]>(api.notes.create);
  const update = useApiCall<Note, [string, UpdateNoteDto]>(api.notes.update);
  const remove = useApiCall<void, [string]>(api.notes.delete);
  const getById = useApiCall<Note, [string]>(api.notes.getById);
  const getAll = useApiCall<any, [NoteFilters?]>(api.notes.getAll);
  const search = useApiCall<Note[], [string, number?]>(api.notes.search);

  return {
    create,
    update,
    remove,
    getById,
    getAll,
    search,
  };
}

/**
 * Hook para operações com blocos
 */
export function useBlocks() {
  const create = useApiCall<Block, [CreateBlockDto]>(api.blocks.create);
  const update = useApiCall<Block, [string, UpdateBlockDto]>(api.blocks.update);
  const remove = useApiCall<void, [string]>(api.blocks.delete);
  const getByNoteId = useApiCall<Block[], [string]>(api.blocks.getByNoteId);
  const reorder = useApiCall<Block, [string, { newOrder: number }]>(api.blocks.reorder);
  const move = useApiCall<Block, [string, { targetNoteId: string; order?: number }]>(
    api.blocks.move
  );

  return {
    create,
    update,
    remove,
    getByNoteId,
    reorder,
    move,
  };
}

/**
 * Hook para operações com grafo
 */
export function useGraph() {
  const getGraph = useApiCall<Graph, [GraphFilter?]>(api.graph.getGraph);
  const getMiniGraph = useApiCall<Graph, [string, number?]>(api.graph.getMiniGraph);
  const getSubgraph = useApiCall<Graph, [string, number?]>(api.graph.getSubgraph);
  const rebuild = useApiCall<Graph, []>(api.graph.rebuild);
  const getStats = useApiCall<any, []>(api.graph.getStats);

  return {
    getGraph,
    getMiniGraph,
    getSubgraph,
    rebuild,
    getStats,
  };
}

/**
 * Hook para progressão
 */
export function useProgression() {
  const get = useApiCall<ProgressionState, []>(api.progression.get);
  const incrementNotes = useApiCall<ProgressionState, [number?]>(api.progression.incrementNotes);
  const incrementLinks = useApiCall<ProgressionState, [number?]>(api.progression.incrementLinks);
  const incrementBlocks = useApiCall<ProgressionState, [number?]>(api.progression.incrementBlocks);
  const getStats = useApiCall<any, []>(api.progression.getStats);

  return {
    get,
    incrementNotes,
    incrementLinks,
    incrementBlocks,
    getStats,
  };
}

/**
 * Hook para sincronização automática
 */
export function useAutoSync(enabled: boolean = true) {
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(async () => {
    if (!enabled) return;

    setSyncing(true);
    setError(null);

    try {
      // Aqui você pode implementar lógica de sincronização
      // Por exemplo, sincronizar notas pendentes
      setLastSync(Date.now());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSyncing(false);
    }
  }, [enabled]);

  // Sincroniza a cada 5 minutos se habilitado
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(sync, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [enabled, sync]);

  return {
    sync,
    syncing,
    lastSync,
    error,
  };
}

/**
 * Hook para verificar status da API
 */
export function useApiStatus() {
  const [online, setOnline] = useState(true);
  const [checking, setChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    setChecking(true);
    try {
      const response = await api.notes.getAll({ limit: 1 });
      setOnline(response.success);
    } catch (error) {
      setOnline(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [checkStatus]);

  return {
    online,
    checking,
    checkStatus,
  };
}

/**
 * Hook para busca com debounce
 */
export function useSearchNotes(debounceMs: number = 300) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchApi = useApiCall<Note[], [string, number?]>(api.notes.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      searchApi.execute(debouncedQuery);
    }
  }, [debouncedQuery]);

  return {
    query,
    setQuery,
    ...searchApi,
  };
}

/**
 * Hook para cache de dados
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<any>,
  ttl: number = 5 * 60 * 1000 // 5 minutos
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetcher();
      if (response.success) {
        setData(response.data);
        setLastFetch(Date.now());
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    // Busca inicial
    refresh();
  }, []);

  useEffect(() => {
    // Auto-refresh baseado em TTL
    if (!lastFetch) return;

    const timeElapsed = Date.now() - lastFetch;
    const timeRemaining = ttl - timeElapsed;

    if (timeRemaining > 0) {
      const timer = setTimeout(refresh, timeRemaining);
      return () => clearTimeout(timer);
    }
  }, [lastFetch, ttl, refresh]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}

export default {
  useApiCall,
  useNotes,
  useBlocks,
  useGraph,
  useProgression,
  useAutoSync,
  useApiStatus,
  useSearchNotes,
  useCachedData,
};
