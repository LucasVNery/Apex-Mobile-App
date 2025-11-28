import { NoteLink } from '@/src/types/note.types';

/**
 * Detecta links no formato [[texto]] (links diretos)
 * e ((texto)) (referências/embeds)
 */
export class LinkParser {
  // Regex para detectar [[links]]
  private static DIRECT_LINK_REGEX = /\[\[([^\]]+)\]\]/g;

  // Regex para detectar ((refs))
  private static REFERENCE_REGEX = /\(\(([^)]+)\)\)/g;

  // Regex para detectar #tags
  private static TAG_REGEX = /#([a-zA-Z0-9_\-]+)/g;

  /**
   * Extrai todos os links de um texto
   */
  static extractLinks(text: string): NoteLink[] {
    const links: NoteLink[] = [];

    // Extrai [[links diretos]]
    let match;
    const directRegex = new RegExp(this.DIRECT_LINK_REGEX.source, 'g');
    while ((match = directRegex.exec(text)) !== null) {
      links.push({
        id: this.generateLinkId(),
        text: match[1],
        type: 'direct',
        position: {
          start: match.index,
          end: match.index + match[0].length,
        },
      });
    }

    // Extrai ((referências))
    const refRegex = new RegExp(this.REFERENCE_REGEX.source, 'g');
    while ((match = refRegex.exec(text)) !== null) {
      links.push({
        id: this.generateLinkId(),
        text: match[1],
        type: 'reference',
        position: {
          start: match.index,
          end: match.index + match[0].length,
        },
      });
    }

    return links;
  }

  /**
   * Extrai tags do texto
   */
  static extractTags(text: string): string[] {
    const tags: string[] = [];
    let match;
    const tagRegex = new RegExp(this.TAG_REGEX.source, 'g');

    while ((match = tagRegex.exec(text)) !== null) {
      tags.push(match[1]);
    }

    return [...new Set(tags)]; // Remove duplicatas
  }

  /**
   * Substitui links por componentes clicáveis
   * Retorna array de segmentos de texto e links
   */
  static parseTextWithLinks(text: string): TextSegment[] {
    const links = this.extractLinks(text);

    if (links.length === 0) {
      return [{ type: 'text', content: text }];
    }

    const segments: TextSegment[] = [];
    let lastIndex = 0;

    // Ordena links por posição
    links.sort((a, b) => a.position.start - b.position.start);

    links.forEach((link) => {
      // Adiciona texto antes do link
      if (link.position.start > lastIndex) {
        segments.push({
          type: 'text',
          content: text.substring(lastIndex, link.position.start),
        });
      }

      // Adiciona o link
      segments.push({
        type: 'link',
        content: link.text,
        link,
      });

      lastIndex = link.position.end;
    });

    // Adiciona texto após o último link
    if (lastIndex < text.length) {
      segments.push({
        type: 'text',
        content: text.substring(lastIndex),
      });
    }

    return segments;
  }

  /**
   * Detecta palavras repetidas que poderiam virar links
   * Retorna sugestões de palavras para linkar
   */
  static suggestLinks(text: string, existingNotes: { id: string; title: string }[]): LinkSuggestion[] {
    const suggestions: LinkSuggestion[] = [];
    const words = text.toLowerCase().split(/\s+/);
    const wordFrequency = new Map<string, number>();

    // Conta frequência de palavras (ignora palavras muito curtas)
    words.forEach(word => {
      const cleanWord = word.replace(/[^a-z0-9]/gi, '');
      if (cleanWord.length >= 3) {
        wordFrequency.set(cleanWord, (wordFrequency.get(cleanWord) || 0) + 1);
      }
    });

    // Busca matches com notas existentes
    existingNotes.forEach(note => {
      const noteTitle = note.title.toLowerCase();

      // Verifica se o título da nota aparece no texto
      if (text.toLowerCase().includes(noteTitle) && noteTitle.length >= 3) {
        const regex = new RegExp(`\\b${noteTitle}\\b`, 'gi');
        let match;

        while ((match = regex.exec(text)) !== null) {
          suggestions.push({
            word: match[0],
            noteId: note.id,
            noteTitle: note.title,
            position: { start: match.index, end: match.index + match[0].length },
            confidence: 'high',
          });
        }
      }
    });

    // Sugestões baseadas em palavras repetidas
    wordFrequency.forEach((count, word) => {
      if (count >= 2) {
        // Busca matches parciais
        const matchingNotes = existingNotes.filter(note =>
          note.title.toLowerCase().includes(word) || word.includes(note.title.toLowerCase())
        );

        matchingNotes.forEach(note => {
          suggestions.push({
            word,
            noteId: note.id,
            noteTitle: note.title,
            confidence: 'medium',
          });
        });
      }
    });

    return suggestions;
  }

  /**
   * Resolve links para IDs de notas
   */
  static resolveLinks(
    links: NoteLink[],
    existingNotes: { id: string; title: string }[]
  ): NoteLink[] {
    return links.map(link => {
      // Fuzzy search para encontrar nota correspondente
      const matchingNote = this.findBestMatch(link.text, existingNotes);

      return {
        ...link,
        targetNoteId: matchingNote?.id,
      };
    });
  }

  /**
   * Busca fuzzy para encontrar melhor match
   */
  private static findBestMatch(
    query: string,
    notes: { id: string; title: string }[]
  ): { id: string; title: string } | null {
    const queryLower = query.toLowerCase();

    // Exact match
    const exactMatch = notes.find(n => n.title.toLowerCase() === queryLower);
    if (exactMatch) return exactMatch;

    // Contains match
    const containsMatch = notes.find(n => n.title.toLowerCase().includes(queryLower));
    if (containsMatch) return containsMatch;

    // Similarity match (Levenshtein distance)
    let bestMatch: { id: string; title: string; similarity: number } | null = null;

    notes.forEach(note => {
      const similarity = this.calculateSimilarity(queryLower, note.title.toLowerCase());
      if (similarity > 0.7 && (!bestMatch || similarity > bestMatch.similarity)) {
        bestMatch = { ...note, similarity };
      }
    });

    return bestMatch ? { id: bestMatch.id, title: bestMatch.title } : null;
  }

  /**
   * Calcula similaridade entre strings (0-1)
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calcula distância de Levenshtein
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private static generateLinkId(): string {
    return `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export interface TextSegment {
  type: 'text' | 'link';
  content: string;
  link?: NoteLink;
}

export interface LinkSuggestion {
  word: string;
  noteId: string;
  noteTitle: string;
  position?: { start: number; end: number };
  confidence: 'high' | 'medium' | 'low';
}
