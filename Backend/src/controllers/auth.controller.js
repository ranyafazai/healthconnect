const { registerUser, loginUser } = require('../services/auth.service');
const { validationResult } = require('express-validator');

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, role } = req.body;
    const user = await registerUser({ email, password, role });

    res.cookie('token', user.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: parseInt(process.env.JWT_EXPIRES_MS || '86400000'),
    });

    return res.status(201).json({ user: user.safeUser });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await loginUser({ email, password });

    res.cookie('token', user.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: parseInt(process.env.JWT_EXPIRES_MS || '86400000'),
    });

    return res.json({ user: user.safeUser });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};

exports.me = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  res.json({ user: req.user });
};
