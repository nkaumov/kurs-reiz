// controllers/userController.js
const pool = require('../config/db');

module.exports.getDashboard = async (req, res) => {
  try {
    // Выводим, например, информацию о пользователе, либо статус текущей заявки и т.п.
    const userId = req.session.user.id;
    
    // Узнаем, есть ли у пользователя активная заявка
    const [applications] = await pool.query(
      'SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    
    let appInfo = null;
    if (applications.length > 0) {
      appInfo = applications[0];
    }
    
    res.render('user/dashboard', { appInfo });
  } catch (err) {
    console.error(err);
    res.render('user/dashboard', { error: 'Ошибка при загрузке дашборда' });
  }
};

module.exports.postApplication = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { vacancyId, candidateAbout } = req.body;
    
    // Создаем заявку
    await pool.query(
      `INSERT INTO applications (user_id, vacancy_id, status, candidate_about)
       VALUES (?, ?, 'pending', ?)`,
      [userId, vacancyId, candidateAbout]
    );
    
    res.redirect('/user/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при создании заявки');
  }
};

module.exports.postSubmitTest = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { applicationId, gitLink, videoLink } = req.body;
    
    // Обновляем заявку, ставим статус "test_submitted"
    await pool.query(
      `UPDATE applications
       SET status = 'test_submitted',
           git_link = ?,
           video_link = ?
       WHERE id = ? AND user_id = ?`,
      [gitLink, videoLink, applicationId, userId]
    );
    
    res.redirect('/user/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при отправке тестового задания');
  }
};
