const prisma = require('../config/database');
const { getTimestamp, successResponse, errorResponse, convertBigIntToNumber } = require('../utils/helpers');

/**
 * GET /api/progression - Busca estado de progressão do usuário
 */
const getProgression = async (req, res) => {
  try {
    const userId = req.userId;

    let progression = await prisma.progressionState.findUnique({
      where: { userId },
      include: { achievements: true },
    });

    // Cria se não existir
    if (!progression) {
      const now = getTimestamp();
      progression = await prisma.progressionState.create({
        data: {
          userId,
          level: 1,
          notesCreated: 0,
          linksCreated: 0,
          blocksUsed: 0,
          tagsUsed: 0,
          graphInteractions: 0,
          unlockedFeatures: ['basic-notes'],
          createdAt: now,
          updatedAt: now,
        },
        include: { achievements: true },
      });
    }

    res.json(successResponse(convertBigIntToNumber(progression)));
  } catch (error) {
    console.error('Erro ao buscar progressão:', error);
    res.status(500).json(errorResponse('Erro ao buscar progressão'));
  }
};

/**
 * PATCH /api/progression - Atualiza progressão
 */
const updateProgression = async (req, res) => {
  try {
    const userId = req.userId;
    const { notesCreated, linksCreated, blocksUsed, tagsUsed, graphInteractions } = req.body;

    const updateData = { updatedAt: getTimestamp() };
    if (notesCreated !== undefined) updateData.notesCreated = notesCreated;
    if (linksCreated !== undefined) updateData.linksCreated = linksCreated;
    if (blocksUsed !== undefined) updateData.blocksUsed = blocksUsed;
    if (tagsUsed !== undefined) updateData.tagsUsed = tagsUsed;
    if (graphInteractions !== undefined) updateData.graphInteractions = graphInteractions;

    const progression = await prisma.progressionState.update({
      where: { userId },
      data: updateData,
      include: { achievements: true },
    });

    res.json(successResponse(convertBigIntToNumber(progression)));
  } catch (error) {
    console.error('Erro ao atualizar progressão:', error);
    res.status(500).json(errorResponse('Erro ao atualizar progressão'));
  }
};

/**
 * PATCH /api/progression/increment/notes - Incrementa contador de notas
 */
const incrementNotes = async (req, res) => {
  try {
    const userId = req.userId;
    const { count = 1 } = req.body;

    const progression = await prisma.progressionState.update({
      where: { userId },
      data: {
        notesCreated: { increment: count },
        updatedAt: getTimestamp(),
      },
      include: { achievements: true },
    });

    res.json(successResponse(convertBigIntToNumber(progression)));
  } catch (error) {
    console.error('Erro ao incrementar notas:', error);
    res.status(500).json(errorResponse('Erro ao incrementar notas'));
  }
};

/**
 * GET /api/progression/stats - Busca estatísticas
 */
const getStats = async (req, res) => {
  try {
    const userId = req.userId;

    const progression = await prisma.progressionState.findUnique({
      where: { userId },
      include: { achievements: true },
    });

    if (!progression) {
      return res.status(404).json(errorResponse('Progressão não encontrada'));
    }

    const stats = {
      level: progression.level,
      totalNotes: progression.notesCreated,
      totalLinks: progression.linksCreated,
      totalBlocks: progression.blocksUsed,
      totalTags: progression.tagsUsed,
      totalGraphInteractions: progression.graphInteractions,
      unlockedFeaturesCount: progression.unlockedFeatures.length,
      achievementsCount: progression.achievements.length,
      progressToNextLevel: calculateProgressToNextLevel(progression),
    };

    res.json(successResponse(stats));
  } catch (error) {
    console.error('Erro ao buscar stats:', error);
    res.status(500).json(errorResponse('Erro ao buscar stats'));
  }
};

function calculateProgressToNextLevel(progression) {
  const nextLevelThreshold = progression.level * 10;
  const progress = Math.min((progression.notesCreated / nextLevelThreshold) * 100, 100);
  return Math.round(progress);
}

module.exports = {
  getProgression,
  updateProgression,
  incrementNotes,
  getStats,
};
