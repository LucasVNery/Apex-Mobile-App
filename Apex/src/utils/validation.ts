/**
 * Utilitários de validação de inputs
 */

/**
 * Valida título de nota
 * @param title - Título a validar
 * @returns Mensagem de erro ou null se válido
 */
export const validateNoteTitle = (title: string): string | null => {
  const trimmed = title.trim();

  if (!trimmed) {
    return 'Título é obrigatório';
  }

  if (trimmed.length < 3) {
    return 'Título deve ter pelo menos 3 caracteres';
  }

  if (trimmed.length > 100) {
    return 'Título deve ter no máximo 100 caracteres';
  }

  // Verificar caracteres inválidos para nomes de arquivo
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(trimmed)) {
    return 'Título contém caracteres inválidos';
  }

  return null;
};

/**
 * Valida array de tags
 * @param tags - Tags a validar
 * @returns Tags válidas (filtradas e sanitizadas)
 */
export const validateTags = (tags: string[]): string[] => {
  return tags
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0 && tag.length <= 50)
    .filter(tag => /^[a-zA-Z0-9\-_]+$/.test(tag)) // Apenas alfanuméricos, hífen e underscore
    .slice(0, 10); // Máximo 10 tags
};

/**
 * Valida string de tags separadas por vírgula
 * @param tagsString - String com tags separadas por vírgula
 * @returns Tags válidas
 */
export const validateTagsString = (tagsString: string): string[] => {
  const tags = tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  return validateTags(tags);
};

/**
 * Valida profundidade de hierarquia
 * @param depth - Profundidade a validar
 * @param maxDepth - Profundidade máxima permitida
 * @returns true se válida
 */
export const validateDepth = (depth: number, maxDepth: number = 10): boolean => {
  return depth >= 0 && depth < maxDepth;
};

/**
 * Valida ID (UUID v4)
 * @param id - ID a validar
 * @returns true se válido
 */
export const validateId = (id: string): boolean => {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(id);
};
