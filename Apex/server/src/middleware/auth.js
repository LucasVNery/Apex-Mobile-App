const { clerkClient } = require('@clerk/clerk-sdk-node');

/**
 * Middleware de autenticação usando Clerk
 * Verifica o token JWT e adiciona userId ao request
 */
const authenticateUser = async (req, res, next) => {
  try {
    // Pega o token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token de autenticação não fornecido',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    try {
      // Verifica o token com Clerk
      const session = await clerkClient.sessions.verifySession(token);

      if (!session || !session.userId) {
        return res.status(401).json({
          success: false,
          error: 'Token inválido ou expirado',
        });
      }

      // Adiciona userId ao request
      req.userId = session.userId;
      next();
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return res.status(401).json({
        success: false,
        error: 'Falha na autenticação',
      });
    }
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

/**
 * Middleware opcional - permite acesso sem autenticação
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.userId = null;
    return next();
  }

  const token = authHeader.substring(7);

  try {
    const session = await clerkClient.sessions.verifySession(token);
    req.userId = session?.userId || null;
  } catch (error) {
    req.userId = null;
  }

  next();
};

module.exports = { authenticateUser, optionalAuth };
