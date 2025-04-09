// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Middleware для проверки авторизации (если пользователь не залогинен — редирект)
function isUser(req, res, next) {
  if (req.session.user && req.session.user.role === 'user') {
    return next();
  }
  return res.redirect('/auth/login');
}

router.get('/dashboard', isUser, userController.getDashboard);
router.post('/apply', isUser, userController.postApplication); // подача заявки
router.post('/submit-test', isUser, userController.postSubmitTest); // отправка тестового задания

module.exports = router;
