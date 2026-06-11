const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Mutate request layer with isolated tenant configuration context
      req.user = {
        id: decoded.id,
        organizationId: decoded.organizationId,
        role: decoded.role
      };

      return next();
    } catch (error) {
      return res.status(401).json({ error: 'System Access Denied: Token validation mismatch.' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'System Access Denied: Bearer token target absent.' });
  }
};

module.exports = { protect };