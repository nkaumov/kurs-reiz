// controllers/authController.js
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

module.exports.getRegisterForm = (req, res) => {
  res.render('register'); // views/register.hbs
};

module.exports.postRegister = async (req, res) => {
  try {
    const { phone, password, firstName, lastName, email } = req.body;
    
    // Проверим, нет ли уже такого телефона
    const [rows] = await pool.query('SELECT id FROM users WHERE phone = ?', [phone]);
    if (rows.length > 0) {
      // Пользователь с таким телефоном уже есть
      return res.render('register', { error: 'Такой номер уже зарегистрирован' });
    }
    
    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Сохраняем в БД
    await pool.query(
      `INSERT INTO users (phone, password, role, first_name, last_name, email) 
       VALUES (?, ?, 'user', ?, ?, ?)`,
      [phone, hashedPassword, firstName, lastName, email]
    );
    
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Ошибка при регистрации' });
  }
};

module.exports.getLoginForm = (req, res) => {
  res.render('login'); // views/login.hbs
};

module.exports.postLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    // Ищем пользователя
    const [rows] = await pool.query('SELECT * FROM users WHERE phone = ?', [phone]);
    if (rows.length === 0) {
      return res.render('login', { error: 'Неверный телефон или пароль' });
    }
    
    const user = rows[0];
    
    // Проверяем пароль
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('login', { error: 'Неверный телефон или пароль' });
    }
    
    // Сохраняем информацию о пользователе в сессии
    req.session.user = {
      id: user.id,
      phone: user.phone,
      role: user.role,
    };
    
    // Перенаправляем в зависимости от роли
    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/user/dashboard');
    }
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Ошибка при входе' });
  }
};

module.exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};
