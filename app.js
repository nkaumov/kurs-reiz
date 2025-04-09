// app.js

const express = require('express');
const path = require('path');
const session = require('express-session');
const exphbs = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 3000;

// Подключим роуты
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Настройка сессий (можно хранить в памяти для примера, но для продакшена лучше подключать store, например, Redis или MySQL)
app.use(
  session({
    secret: 'secret-key-for-sessions', // должен быть в .env
    resave: false,
    saveUninitialized: false,
  })
);

// Настраиваем парсинг тела запроса (POST формы)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Настраиваем Handlebars
app.engine(
  'hbs',
  exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    // Можно добавить helpers,partialsDir и т.д.
  })
);


const hbs = exphbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {
    eq: (a, b) => a === b,
    neq: (a, b) => a !== b,
    gt: (a, b) => a > b,
    lt: (a, b) => a < b,
    or: (a, b) => a || b,
    and: (a, b) => a && b,
  },
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');


app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Подключаем статические файлы (Materialize CSS, свои стили, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Роут для главной (пример)
app.get('/', (req, res) => {
  res.render('index'); // views/index.hbs
});

// Подключаем маршруты
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
