const prisma = require('../config/database');
const { getTimestamp, successResponse, errorResponse, convertBigIntToNumber } = require('../utils/helpers');

/**
 * GET /api/graph - Busca grafo completo
 */
const getGraph = async (req, res) => {
  try {
    const userId = req.userId;
    const { tags, minConnections } = req.query;

    // Busca notas do usuário
    const where = { userId };
    if (tags) {
      where.tags = { hasSome: tags.split(',') };
    }

    const notes = await prisma.note.findMany({
      where,
      include: {
        connectionsFrom: true,
        connectionsTo: true,
      },
    });

    // Monta nós
    const nodes = notes.map((note) => ({
      id: note.id,
      noteId: note.id,
      title: note.title,
      connections: note.connectionsFrom.length + note.connectionsTo.length,
      tags: note.tags,
      type: note.isRoot ? 'root' : note.depth === 0 ? 'orphan' : 'child',
      depth: note.depth,
      isRoot: note.isRoot,
      childrenCount: note.childrenIds.length,
      color: note.color,
    }));

    // Filtra por minConnections
    let filteredNodes = nodes;
    if (minConnections) {
      filteredNodes = nodes.filter((n) => n.connections >= parseInt(minConnections));
    }

    // Monta arestas
    const edges = [];
    const nodeIds = new Set(filteredNodes.map((n) => n.id));

    for (const note of notes) {
      if (!nodeIds.has(note.id)) continue;

      for (const conn of note.connectionsFrom) {
        if (nodeIds.has(conn.toNoteId)) {
          edges.push({
            id: conn.id,
            source: conn.fromNoteId,
            target: conn.toNoteId,
            weight: conn.weight,
            type: conn.linkType,
          });
        }
      }
    }

    const graph = {
      nodes: filteredNodes,
      edges,
      rootNodes: filteredNodes.filter((n) => n.isRoot).map((n) => n.id),
    };

    res.json(successResponse(convertBigIntToNumber(graph)));
  } catch (error) {
    console.error('Erro ao buscar grafo:', error);
    res.status(500).json(errorResponse('Erro ao buscar grafo'));
  }
};

/**
 * GET /api/graph/mini/:noteId - Mini-grafo de uma nota
 */
const getMiniGraph = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { depth = 1 } = req.query;
    const userId = req.userId;

    // Verifica se nota existe
    const note = await prisma.note.findFirst({
      where: { id: noteId, userId },
    });

    if (!note) {
      return res.status(404).json(errorResponse('Nota não encontrada'));
    }

    // Busca conexões da nota
    const connections = await prisma.noteConnection.findMany({
      where: {
        OR: [{ fromNoteId: noteId }, { toNoteId: noteId }],
      },
      include: {
        fromNote: true,
        toNote: true,
      },
    });

    // Monta nós (nota central + vizinhos)
    const noteIds = new Set([noteId]);
    connections.forEach((conn) => {
      noteIds.add(conn.fromNoteId);
      noteIds.add(conn.toNoteId);
    });

    const notes = await prisma.note.findMany({
      where: {
        id: { in: Array.from(noteIds) },
        userId,
      },
    });

    const nodes = notes.map((n) => ({
      id: n.id,
      noteId: n.id,
      title: n.title,
      connections: connections.filter((c) => c.fromNoteId === n.id || c.toNoteId === n.id).length,
      tags: n.tags,
      isRoot: n.isRoot,
      color: n.color,
    }));

    const edges = connections.map((conn) => ({
      id: conn.id,
      source: conn.fromNoteId,
      target: conn.toNoteId,
      weight: conn.weight,
      type: conn.linkType,
    }));

    res.json(successResponse(convertBigIntToNumber({ nodes, edges })));
  } catch (error) {
    console.error('Erro ao buscar mini-grafo:', error);
    res.status(500).json(errorResponse('Erro ao buscar mini-grafo'));
  }
};

/**
 * POST /api/graph/rebuild - Reconstrói grafo
 */
const rebuildGraph = async (req, res) => {
  try {
    const userId = req.userId;

    // Deleta edges e nodes antigos do usuário
    const notes = await prisma.note.findMany({
      where: { userId },
      select: { id: true },
    });

    const noteIds = notes.map((n) => n.id);

    await prisma.graphEdge.deleteMany({
      where: { source: { in: noteIds } },
    });

    await prisma.graphNode.deleteMany({
      where: { noteId: { in: noteIds } },
    });

    // Reconstrói nodes
    const notesWithData = await prisma.note.findMany({
      where: { userId },
      include: {
        connectionsFrom: true,
        connectionsTo: true,
      },
    });

    const now = getTimestamp();

    for (const note of notesWithData) {
      await prisma.graphNode.create({
        data: {
          noteId: note.id,
          title: note.title,
          connections: note.connectionsFrom.length + note.connectionsTo.length,
          tags: note.tags,
          type: note.isRoot ? 'root' : 'child',
          depth: note.depth,
          isRoot: note.isRoot,
          childrenCount: note.childrenIds.length,
          color: note.color,
          createdAt: now,
          updatedAt: now,
        },
      });
    }

    // Reconstrói edges
    const connections = await prisma.noteConnection.findMany({
      where: {
        fromNoteId: { in: noteIds },
      },
    });

    for (const conn of connections) {
      await prisma.graphEdge.create({
        data: {
          source: conn.fromNoteId,
          target: conn.toNoteId,
          weight: conn.weight,
          type: conn.linkType,
          createdAt: now,
        },
      });
    }

    res.json(successResponse(null, 'Grafo reconstruído com sucesso'));
  } catch (error) {
    console.error('Erro ao reconstruir grafo:', error);
    res.status(500).json(errorResponse('Erro ao reconstruir grafo'));
  }
};

/**
 * GET /api/graph/stats - Estatísticas do grafo
 */
const getStats = async (req, res) => {
  try {
    const userId = req.userId;

    const notes = await prisma.note.findMany({
      where: { userId },
    });

    const connections = await prisma.noteConnection.findMany({
      where: {
        fromNoteId: { in: notes.map((n) => n.id) },
      },
    });

    const stats = {
      nodeCount: notes.length,
      edgeCount: connections.length,
      hierarchyEdges: connections.filter((c) => c.linkType === 'hierarchy').length,
      linkEdges: connections.filter((c) => c.linkType === 'direct' || c.linkType === 'reference').length,
      rootCount: notes.filter((n) => n.isRoot).length,
      maxDepth: Math.max(...notes.map((n) => n.depth), 0),
      avgChildrenCount: notes.length > 0 ? notes.reduce((sum, n) => sum + n.childrenIds.length, 0) / notes.length : 0,
    };

    res.json(successResponse(stats));
  } catch (error) {
    console.error('Erro ao buscar stats do grafo:', error);
    res.status(500).json(errorResponse('Erro ao buscar stats'));
  }
};

module.exports = {
  getGraph,
  getMiniGraph,
  rebuildGraph,
  getStats,
};
