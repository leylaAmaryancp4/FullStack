const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const adminOnly = require('../middlewares/adminOnly');
const requireAuth = require('../middlewares/auth');

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/me', requireAuth, authController.getMe);



router.patch(
  '/users/:id/role',
  requireAuth,
  adminOnly,
  authController.updateUserRole
);

module.exports = router;