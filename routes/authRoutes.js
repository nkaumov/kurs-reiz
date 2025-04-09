// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Страница формы регистрации
router.get('/register', authController.getRegisterForm);
// Обработка формы регистрации
router.post('/register', authController.postRegister);

// Страница формы логина
router.get('/login', authController.getLoginForm);
// Обработка формы логина
router.post('/login', authController.postLogin);

// Логаут
router.get('/logout', authController.logout);

module.exports = router;
