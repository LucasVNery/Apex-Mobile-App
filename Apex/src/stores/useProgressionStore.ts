import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import {
  ProgressionState,
  Feature,
  FeatureLevel,
  Achievement,
  FEATURE_REQUIREMENTS,
} from '@/src/types/progression.types';

interface ProgressionStore extends ProgressionState {
  // Actions
  incrementNotes: () => void;
  incrementLinks: () => void;
  incrementBlocks: () => void;
  incrementTags: () => void;
  incrementGraphInteractions: () => void;
  checkAndUnlockFeatures: () => void;
  isFeatureUnlocked: (feature: Feature) => boolean;
  getLevel: () => FeatureLevel;
  shouldShowFeatureUnlock: (feature: Feature) => boolean;
  markFeatureShown: (feature: Feature) => void;
  addAchievement: (achievement: Achievement) => void;
  resetProgression: () => void;
  syncWithRealData: (notesCount: number, linksCount: number, blocksCount: number, tagsCount: number) => void;

  // Internal state for UI
  pendingUnlocks: Feature[];
  shownFeatures: Feature[];
}

export const useProgressionStore = create<ProgressionStore>()(
  persist(
    (set, get) => ({
      // Initial state
      level: 1,
      notesCreated: 0,
      linksCreated: 0,
      blocksUsed: 0,
      tagsUsed: 0,
      graphInteractions: 0,
      unlockedFeatures: ['basic-notes'],
      achievements: [],
      pendingUnlocks: [],
      shownFeatures: [],

      incrementNotes: () => {
        set((state) => ({ notesCreated: state.notesCreated + 1 }));
        get().checkAndUnlockFeatures();
      },

      incrementLinks: () => {
        set((state) => ({ linksCreated: state.linksCreated + 1 }));
        get().checkAndUnlockFeatures();
      },

      incrementBlocks: () => {
        set((state) => ({ blocksUsed: state.blocksUsed + 1 }));
        get().checkAndUnlockFeatures();
      },

      incrementTags: () => {
        set((state) => ({ tagsUsed: state.tagsUsed + 1 }));
        get().checkAndUnlockFeatures();
      },

      incrementGraphInteractions: () => {
        set((state) => ({ graphInteractions: state.graphInteractions + 1 }));
        get().checkAndUnlockFeatures();
      },

      checkAndUnlockFeatures: () => {
        const state = get();
        const newUnlocks: Feature[] = [];

        FEATURE_REQUIREMENTS.forEach((req) => {
          // Já desbloqueada
          if (state.unlockedFeatures.includes(req.feature)) return;

          // Verifica requisitos
          const meetsNotes = !req.requiredNotes || state.notesCreated >= req.requiredNotes;
          const meetsLinks = !req.requiredLinks || state.linksCreated >= req.requiredLinks;
          const meetsInteractions =
            !req.requiredInteractions || state.graphInteractions >= req.requiredInteractions;

          if (meetsNotes && meetsLinks && meetsInteractions) {
            newUnlocks.push(req.feature);
          }
        });

        if (newUnlocks.length > 0) {
          set((state) => ({
            unlockedFeatures: [...state.unlockedFeatures, ...newUnlocks],
            pendingUnlocks: [...state.pendingUnlocks, ...newUnlocks],
          }));

          // Atualiza nível baseado nas features desbloqueadas
          get().updateLevel();

          // Adiciona conquistas
          newUnlocks.forEach((feature) => {
            get().addFeatureAchievement(feature);
          });
        }
      },

      updateLevel: () => {
        const state = get();
        let newLevel: FeatureLevel = 1;

        if (state.notesCreated >= 15 || state.linksCreated >= 5) {
          newLevel = 3;
        } else if (state.notesCreated >= 5 || state.linksCreated >= 2) {
          newLevel = 2;
        }

        if (newLevel !== state.level) {
          set({ level: newLevel });
        }
      },

      isFeatureUnlocked: (feature: Feature) => {
        return get().unlockedFeatures.includes(feature);
      },

      getLevel: () => {
        return get().level;
      },

      shouldShowFeatureUnlock: (feature: Feature) => {
        const state = get();
        return (
          state.pendingUnlocks.includes(feature) &&
          !state.shownFeatures.includes(feature)
        );
      },

      markFeatureShown: (feature: Feature) => {
        set((state) => ({
          pendingUnlocks: state.pendingUnlocks.filter((f) => f !== feature),
          shownFeatures: [...state.shownFeatures, feature],
        }));
      },

      addAchievement: (achievement: Achievement) => {
        set((state) => ({
          achievements: [...state.achievements, achievement],
        }));
      },

      resetProgression: () => {
        set({
          level: 1,
          notesCreated: 0,
          linksCreated: 0,
          blocksUsed: 0,
          tagsUsed: 0,
          graphInteractions: 0,
          unlockedFeatures: ['basic-notes'],
          achievements: [],
          pendingUnlocks: [],
          shownFeatures: [],
        });
      },

      // Sincronizar contadores com dados reais do NotesStore
      syncWithRealData: (notesCount: number, linksCount: number, blocksCount: number, tagsCount: number) => {
        set({
          notesCreated: notesCount,
          linksCreated: linksCount,
          blocksUsed: blocksCount,
          tagsUsed: tagsCount,
        });
        get().checkAndUnlockFeatures();
      },

      addFeatureAchievement: (feature: Feature) => {
        const achievementMap: Record<Feature, { title: string; description: string; icon: string }> = {
          'basic-notes': {
            title: 'Primeira Nota',
            description: 'Você criou sua primeira nota!',
            icon: 'create-outline',
          },
          'search': {
            title: 'Explorador',
            description: 'Busca de notas desbloqueada',
            icon: 'search-outline',
          },
          'auto-links': {
            title: 'Conexões Inteligentes',
            description: 'O sistema agora sugere links automáticos',
            icon: 'git-branch-outline',
          },
          'mini-graph': {
            title: 'Primeira Rede',
            description: 'Veja como suas ideias se conectam',
            icon: 'git-network-outline',
          },
          'tags': {
            title: 'Organizador',
            description: 'Tags desbloqueadas para organização',
            icon: 'pricetag-outline',
          },
          'full-graph': {
            title: 'Visão Completa',
            description: 'Graph view em tela cheia disponível',
            icon: 'analytics-outline',
          },
          'advanced-blocks': {
            title: 'Mestre dos Blocos',
            description: 'Todos os tipos de blocos desbloqueados',
            icon: 'grid-outline',
          },
          'templates': {
            title: 'Templates',
            description: 'Templates prontos disponíveis',
            icon: 'document-outline',
          },
          'tables': {
            title: 'Tabelas',
            description: 'Crie tabelas e organize dados',
            icon: 'table-outline',
          },
          'kanban': {
            title: 'Kanban',
            description: 'Visualização em quadros disponível',
            icon: 'apps-outline',
          },
        };

        const achievementData = achievementMap[feature];
        if (achievementData) {
          get().addAchievement({
            id: uuidv4(),  // Usar UUID em vez de template string
            ...achievementData,
            unlockedAt: Date.now(),  // Usar timestamp
          });
        }
      },
    }),
    {
      name: 'progression-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
