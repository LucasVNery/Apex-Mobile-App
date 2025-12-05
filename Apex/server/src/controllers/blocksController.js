const prisma = require('../config/database');
const { getTimestamp, successResponse, errorResponse, convertBigIntToNumber } = require('../utils/helpers');

/**
 * GET /api/blocks/note/:noteId - Busca blocos de uma nota
 */
const getBlocksByNoteId = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.userId;

    // Verifica se nota pertence ao usuário
    const note = await prisma.note.findFirst({
      where: { id: noteId, userId },
    });

    if (!note) {
      return res.status(404).json(errorResponse('Nota não encontrada'));
    }

    const blocks = await prisma.block.findMany({
      where: { noteId },
      orderBy: { order: 'asc' },
      include: { links: true },
    });

    res.json(successResponse(convertBigIntToNumber(blocks)));
  } catch (error) {
    console.error('Erro ao buscar blocos:', error);
    res.status(500).json(errorResponse('Erro ao buscar blocos'));
  }
};

/**
 * POST /api/blocks - Cria novo bloco
 */
const createBlock = async (req, res) => {
  try {
    const { noteId, type, content, order, parentId, metadata } = req.body;
    const userId = req.userId;

    // Verifica se nota pertence ao usuário
    const note = await prisma.note.findFirst({
      where: { id: noteId, userId },
    });

    if (!note) {
      return res.status(404).json(errorResponse('Nota não encontrada'));
    }

    const now = getTimestamp();

    const block = await prisma.block.create({
      data: {
        noteId,
        type,
        content: content || null,
        order,
        parentId,
        metadata,
        createdAt: now,
        updatedAt: now,
      },
      include: { links: true },
    });

    // Atualiza timestamp da nota
    await prisma.note.update({
      where: { id: noteId },
      data: { updatedAt: now },
    });

    res.status(201).json(successResponse(convertBigIntToNumber(block)));
  } catch (error) {
    console.error('Erro ao criar bloco:', error);
    res.status(500).json(errorResponse('Erro ao criar bloco'));
  }
};

/**
 * PUT /api/blocks/:id - Atualiza bloco
 */
const updateBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, content, order, parentId, metadata, selected } = req.body;
    const userId = req.userId;

    // Verifica se bloco pertence ao usuário
    const block = await prisma.block.findFirst({
      where: { id },
      include: { note: true },
    });

    if (!block || block.note.userId !== userId) {
      return res.status(404).json(errorResponse('Bloco não encontrado'));
    }

    const now = getTimestamp();

    const updateData = { updatedAt: now };
    if (type !== undefined) updateData.type = type;
    if (content !== undefined) updateData.content = content;
    if (order !== undefined) updateData.order = order;
    if (parentId !== undefined) updateData.parentId = parentId;
    if (metadata !== undefined) updateData.metadata = metadata;
    if (selected !== undefined) updateData.selected = selected;

    const updatedBlock = await prisma.block.update({
      where: { id },
      data: updateData,
      include: { links: true },
    });

    // Atualiza timestamp da nota
    await prisma.note.update({
      where: { id: block.noteId },
      data: { updatedAt: now },
    });

    res.json(successResponse(convertBigIntToNumber(updatedBlock)));
  } catch (error) {
    console.error('Erro ao atualizar bloco:', error);
    res.status(500).json(errorResponse('Erro ao atualizar bloco'));
  }
};

/**
 * DELETE /api/blocks/:id - Deleta bloco
 */
const deleteBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const block = await prisma.block.findFirst({
      where: { id },
      include: { note: true },
    });

    if (!block || block.note.userId !== userId) {
      return res.status(404).json(errorResponse('Bloco não encontrado'));
    }

    await prisma.block.delete({ where: { id } });

    // Atualiza timestamp da nota
    await prisma.note.update({
      where: { id: block.noteId },
      data: { updatedAt: getTimestamp() },
    });

    res.json(successResponse(null, 'Bloco deletado com sucesso'));
  } catch (error) {
    console.error('Erro ao deletar bloco:', error);
    res.status(500).json(errorResponse('Erro ao deletar bloco'));
  }
};

/**
 * PATCH /api/blocks/:id/reorder - Reordena bloco
 */
const reorderBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const { newOrder } = req.body;
    const userId = req.userId;

    const block = await prisma.block.findFirst({
      where: { id },
      include: { note: true },
    });

    if (!block || block.note.userId !== userId) {
      return res.status(404).json(errorResponse('Bloco não encontrado'));
    }

    const updatedBlock = await prisma.block.update({
      where: { id },
      data: { order: newOrder, updatedAt: getTimestamp() },
    });

    res.json(successResponse(convertBigIntToNumber(updatedBlock)));
  } catch (error) {
    console.error('Erro ao reordenar bloco:', error);
    res.status(500).json(errorResponse('Erro ao reordenar bloco'));
  }
};

module.exports = {
  getBlocksByNoteId,
  createBlock,
  updateBlock,
  deleteBlock,
  reorderBlock,
};
