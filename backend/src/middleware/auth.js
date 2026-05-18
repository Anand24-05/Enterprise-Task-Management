const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized. No token provided.' });
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ error: 'Please verify your email to access this resource.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please refresh your token.' });
    }
    return res.status(401).json({ error: 'Not authorized. Invalid token.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Role '${req.user.role}' is not authorized for this action.` });
    }
    next();
  };
};

const requireSameCompany = async (req, res, next) => {
  const { companyId } = req.user;
  if (!companyId) {
    return res.status(403).json({ error: 'You must belong to a company for this action.' });
  }
  req.companyId = companyId;
  next();
};

module.exports = { protect, authorize, requireSameCompany };
