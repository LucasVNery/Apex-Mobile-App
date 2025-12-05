const prisma = require('../config/database');
const {
  getTimestamp,
  successResponse,
  errorResponse,
  calculateHierarchyMetadata,
  convertBigIntToNumber,
} = require('../utils/helpers');

/**
 * GET /api/notes - Lista todas as notas com filtros
 */
const getAllNotes = async (req, res) => {
  try {
    const {
      search,
      tags,
      parentId,
      isRoot,
      color,
      limit = 50,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const userId = req.userId;

    // Monta filtros
    const where = { userId };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    if (tags) {
      where.tags = { hasSome: tags.split(',') };
    }

    if (parentId) {
      where.parentId = parentId;
    }

    if (isRoot === 'true') {
      where.isRoot = true;
    }

    if (color) {
      where.color = color;
    }

    // Busca notas
    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { [sortBy]: sortOrder },
        include: {
          blocks: true,
          children: true,
        },
      }),
      prisma.note.count({ where }),
    ]);

    const items = convertBigIntToNumber(notes);

    res.json(successResponse({
      items,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: parseInt(offset) + parseInt(limit) < total,
    }));
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    res.status(500).json(errorResponse('Erro ao buscar notas'));
  }
};

/**
 * GET /api/notes/:id - Busca nota por ID
 */
const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const note = await prisma.note.findFirst({
      where: { id, userId },
      include: {
        blocks: { orderBy: { order: 'asc' } },
        children: true,
        parent: true,
      },
    });

    if (!note) {
      return res.status(404).json(errorResponse('Nota não encontrada'));
    }

    res.json(successResponse(convertBigIntToNumber(note)));
  } catch (error) {
    console.error('Erro ao buscar nota:', error);
    res.status(500).json(errorResponse('Erro ao buscar nota'));
  }
};

/**
 * POST /api/notes - Cria nova nota
 */
const createNote = async (req, res) => {
  try {
    const { title, tags = [], color, parentId, hierarchyOrder = 0 } = req.body;
    const userId = req.userId;

    if (!title || title.trim() === '') {
      return res.status(400).json(errorResponse('Título é obrigatório'));
    }

    const now = getTimestamp();

    // Calcula hierarquia se tiver parent
    let hierarchyData = {
      depth: 0,
      path: [],
      isRoot: true,
    };

    if (parentId) {
      hierarchyData = await calculateHierarchyMetadata(parentId, prisma);
      hierarchyData.depth += 1;
      hierarchyData.path.push(parentId);
      hierarchyData.isRoot = false;
    }

    // Cria nota
    const note = await prisma.note.create({
      data: {
        title: title.trim(),
        tags,
        color,
        parentId,
        userId,
        hierarchyOrder,
        createdAt: now,
        updatedAt: now,
        ...hierarchyData,
      },
      include: {
        blocks: true,
      },
    });

    // Atualiza childrenIds do parent
    if (parentId) {
      const parent = await prisma.note.findUnique({
        where: { id: parentId },
        select: { childrenIds: true },
      });

      await prisma.note.update({
        where: { id: parentId },
        data: {
          childrenIds: [...(parent.childrenIds || []), note.id],
        },
      });
    }

    res.status(201).json(successResponse(convertBigIntToNumber(note)));
  } catch (error) {
    console.error('Erro ao criar nota:', error);
    res.status(500).json(errorResponse('Erro ao criar nota'));
  }
};

/**
 * PUT /api/notes/:id - Atualiza nota
 */
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, tags, color, parentId, hierarchyOrder } = req.body;
    const userId = req.userId;

    // Verifica se nota existe e pertence ao usuário
    const existingNote = await prisma.note.findFirst({
      where: { id, userId },
    });

    if (!existingNote) {
      return res.status(404).json(errorResponse('Nota não encontrada'));
    }

    const now = getTimestamp();

    const updateData = {
      updatedAt: now,
    };

    if (title !== undefined) updateData.title = title;
    if (tags !== undefined) updateData.tags = tags;
    if (color !== undefined) updateData.color = color;
    if (hierarchyOrder !== undefined) updateData.hierarchyOrder = hierarchyOrder;

    // Se mudou o parent, recalcula hierarquia
    if (parentId !== undefined && parentId !== existingNote.parentId) {
      // Remove da lista de children do parent antigo
      if (existingNote.parentId) {
        const oldParent = await prisma.note.findUnique({
          where: { id: existingNote.parentId },
          select: { childrenIds: true },
        });

        await prisma.note.update({
          where: { id: existingNote.parentId },
          data: {
            childrenIds: oldParent.childrenIds.filter((cid) => cid !== id),
          },
        });
      }

      // Adiciona ao novo parent
      if (parentId) {
        const newParent = await prisma.note.findUnique({
          where: { id: parentId },
          select: { childrenIds: true },
        });

        await prisma.note.update({
          where: { id: parentId },
          data: {
            childrenIds: [...(newParent.childrenIds || []), id],
          },
        });

        // Recalcula hierarquia
        const hierarchyData = await calculateHierarchyMetadata(parentId, prisma);
        updateData.depth = hierarchyData.depth + 1;
        updateData.path = [...hierarchyData.path, parentId];
        updateData.isRoot = false;
      } else {
        updateData.depth = 0;
        updateData.path = [];
        updateData.isRoot = true;
      }

      updateData.parentId = parentId;
    }

    const note = await prisma.note.update({
      where: { id },
      data: updateData,
      include: {
        blocks: true,
      },
    });

    res.json(successResponse(convertBigIntToNumber(note)));
  } catch (error) {
    console.error('Erro ao atualizar nota:', error);
    res.status(500).json(errorResponse('Erro ao atualizar nota'));
  }
};

/**
 * DELETE /api/notes/:id - Deleta nota
 */
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const note = await prisma.note.findFirst({
      where: { id, userId },
      include: { children: true },
    });

    if (!note) {
      return res.status(404).json(errorResponse('Nota não encontrada'));
    }

    // Remove da lista de children do parent
    if (note.parentId) {
      const parent = await prisma.note.findUnique({
        where: { id: note.parentId },
        select: { childrenIds: true },
      });

      await prisma.note.update({
        where: { id: note.parentId },
        data: {
          childrenIds: parent.childrenIds.filter((cid) => cid !== id),
        },
      });
    }

    // Deleta nota (cascade vai deletar blocks, links, etc)
    await prisma.note.delete({ where: { id } });

    res.json(successResponse(null, 'Nota deletada com sucesso'));
  } catch (error) {
    console.error('Erro ao deletar nota:', error);
    res.status(500).json(errorResponse('Erro ao deletar nota'));
  }
};

/**
 * GET /api/notes/roots - Busca notas raiz
 */
const getRootNotes = async (req, res) => {
  try {
    const userId = req.userId;

    const notes = await prisma.note.findMany({
      where: {
        userId,
        isRoot: true,
      },
      include: {
        blocks: true,
        children: true,
      },
      orderBy: { hierarchyOrder: 'asc' },
    });

    res.json(successResponse(convertBigIntToNumber(notes)));
  } catch (error) {
    console.error('Erro ao buscar raízes:', error);
    res.status(500).json(errorResponse('Erro ao buscar raízes'));
  }
};

/**
 * GET /api/notes/:id/children - Busca filhos de uma nota
 */
const getChildren = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const children = await prisma.note.findMany({
      where: {
        parentId: id,
        userId,
      },
      include: {
        blocks: true,
      },
      orderBy: { hierarchyOrder: 'asc' },
    });

    res.json(successResponse(convertBigIntToNumber(children)));
  } catch (error) {
    console.error('Erro ao buscar filhos:', error);
    res.status(500).json(errorResponse('Erro ao buscar filhos'));
  }
};

/**
 * GET /api/notes/search - Busca full-text
 */
const searchNotes = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    const userId = req.userId;

    if (!q) {
      return res.status(400).json(errorResponse('Query de busca é obrigatória'));
    }

    const notes = await prisma.note.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { tags: { has: q } },
        ],
      },
      take: parseInt(limit),
      include: {
        blocks: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(successResponse(convertBigIntToNumber(notes)));
  } catch (error) {
    console.error('Erro ao buscar:', error);
    res.status(500).json(errorResponse('Erro ao buscar'));
  }
};

/**
 * GET /api/notes/tags - Busca todas as tags únicas
 */
const getAllTags = async (req, res) => {
  try {
    const userId = req.userId;

    const notes = await prisma.note.findMany({
      where: { userId },
      select: { tags: true },
    });

    const allTags = new Set();
    notes.forEach((note) => {
      note.tags.forEach((tag) => allTags.add(tag));
    });

    res.json(successResponse(Array.from(allTags).sort()));
  } catch (error) {
    console.error('Erro ao buscar tags:', error);
    res.status(500).json(errorResponse('Erro ao buscar tags'));
  }
};

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getRootNotes,
  getChildren,
  searchNotes,
  getAllTags,
};
