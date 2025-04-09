const express = require('express');
const path = require('path');
const session = require('express-session');
const exphbs = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 3000;

// Роуты
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { requireAuth } = require('./middleware/auth'); // наш middleware

// Сессии
app.use(
  session({
    secret: 'secret-key-for-sessions', // в проде — через .env
    resave: false,
    saveUninitialized: false,
  })
);

// Парсинг данных из форм
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//  Отключаем кеш, чтобы нельзя было вернуться на защищённую страницу после logout
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// session доступна во всех шаблонах
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Глобальная проверка доступа: неавторизованные могут видеть только /auth/*
app.use((req, res, next) => {
  const openPaths = ['/auth/login', '/auth/register'];
  const isAuthRoute = req.path.startsWith('/auth');
  if (!req.session.user && !openPaths.includes(req.path) && !isAuthRoute) {
    return res.redirect('/auth/login');
  }
  next();
});

// Handlebars + helpers + partials
const hbs = exphbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  partialsDir: path.join(__dirname, 'views', 'partials'),
  helpers: {
    eq: (a, b) => a === b,
    neq: (a, b) => a !== b,
    gt: (a, b) => a > b,
    lt: (a, b) => a < b,
    or: (a, b) => a || b,
    and: (a, b) => a && b,
    notEmpty: (arr) => Array.isArray(arr) && arr.length > 0,
    statusText: (status) => {
        const map = {
          0: '⏳ Ожидает решения',
          'pending': '⏳ Ожидает решения',
          1: '❌ Отклонена',
          'rejected': '❌ Отклонена',
          2: '📝 Выдано тестовое задание',
          'test_assigned': '📝 Выдано тестовое задание',
          3: '❌ Тестовое задание отклонено',
          'test_rejected': '❌ Тестовое задание отклонено',
          4: '🎉 Приглашён на собеседование',
          'invited': '🎉 Приглашён на собеседование',
          5: '📤 Задание отправлено',
          'test_submitted': '📤 Задание отправлено',
        };
        return map[status] || 'Неизвестно';
      }
      
  },
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Папка для CSS / JS / иконок
app.use(express.static(path.join(__dirname, 'public')));

// Главная (только для авторизованных)
app.get('/', requireAuth, (req, res) => {
  res.render('index', { user: req.session.user });
});

// Все роуты
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

// Запуск
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
