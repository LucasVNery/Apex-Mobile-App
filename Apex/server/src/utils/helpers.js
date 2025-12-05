/**
 * Helpers gerais
 */

/**
 * Retorna timestamp atual
 */
const getTimestamp = () => {
  return BigInt(Date.now());
};

/**
 * Formata resposta de sucesso
 */
const successResponse = (data, message = null) => {
  return {
    success: true,
    data,
    message,
  };
};

/**
 * Formata resposta de erro
 */
const errorResponse = (error, code = null) => {
  return {
    success: false,
    error: error instanceof Error ? error.message : error,
    code,
  };
};

/**
 * Handler de erros async
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Calcula profundidade e path de hierarquia
 */
const calculateHierarchyMetadata = async (noteId, prisma) => {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: { parent: true },
  });

  if (!note) return null;

  if (!note.parentId) {
    // É raiz
    return {
      depth: 0,
      path: [],
      isRoot: true,
    };
  }

  // Busca ancestors recursivamente
  const ancestors = [];
  let currentNote = note;
  let depth = 0;

  while (currentNote.parentId) {
    depth++;
    ancestors.push(currentNote.parentId);

    currentNote = await prisma.note.findUnique({
      where: { id: currentNote.parentId },
      include: { parent: true },
    });

    if (!currentNote || depth > 10) break; // Proteção contra loop infinito
  }

  return {
    depth,
    path: ancestors.reverse(),
    isRoot: false,
  };
};

/**
 * Converte BigInt para número (para JSON)
 */
const convertBigIntToNumber = (obj) => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'bigint') {
    return Number(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToNumber);
  }

  if (typeof obj === 'object') {
    const converted = {};
    for (const key in obj) {
      converted[key] = convertBigIntToNumber(obj[key]);
    }
    return converted;
  }

  return obj;
};

module.exports = {
  getTimestamp,
  successResponse,
  errorResponse,
  asyncHandler,
  calculateHierarchyMetadata,
  convertBigIntToNumber,
};
