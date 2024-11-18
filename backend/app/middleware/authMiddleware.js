const jwt = require('jsonwebtoken');
const User = require('../db/models/User');

const authenticateToken = (allowedRoles = []) => {
  return async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Brak tokenu. Zaloguj się.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.id);

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Brak uprawnień.' }); 
      }

      req.user = user;
      
      if (!user) {
        return res.status(403).json({ message: 'Nieprawidłowy użytkownik lub użytkownik nie istnieje.' });
      }

      next();
    } catch (error) {
      return res.sendStatus(403); 
    }
  };
};

module.exports = {
  authenticateToken,
};
