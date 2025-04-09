// controllers/adminController.js
const pool = require('../config/db');

module.exports.getDashboard = (req, res) => {
  // Администраторский дашборд
  res.render('admin/dashboard');
};

module.exports.getVacancies = async (req, res) => {
  try {
    const [vacancies] = await pool.query('SELECT * FROM vacancies');
    res.render('admin/vacancies', { vacancies });
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при получении списка вакансий');
  }
};

module.exports.createVacancy = async (req, res) => {
  try {
    const { title, description, isActive } = req.body;
    await pool.query(
      'INSERT INTO vacancies (title, description, is_active) VALUES (?, ?, ?)',
      [title, description, isActive ? 1 : 0]
    );
    res.redirect('/admin/vacancies');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при создании вакансии');
  }
};

module.exports.updateVacancy = async (req, res) => {
  try {
    const { id, title, description, isActive } = req.body;
    await pool.query(
      'UPDATE vacancies SET title = ?, description = ?, is_active = ? WHERE id = ?',
      [title, description, isActive ? 1 : 0, id]
    );
    res.redirect('/admin/vacancies');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при обновлении вакансии');
  }
};

module.exports.deleteVacancy = async (req, res) => {
  try {
    const { id } = req.body;
    await pool.query('DELETE FROM vacancies WHERE id = ?', [id]);
    res.redirect('/admin/vacancies');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при удалении вакансии');
  }
};

module.exports.getApplications = async (req, res) => {
    try {
      const [apps] = await pool.query(`
        SELECT a.*,
               u.first_name,
               u.last_name,
               v.title AS vacancy_title,
               ta.title AS test_title
        FROM applications a
        JOIN users u ON u.id = a.user_id
        JOIN vacancies v ON v.id = a.vacancy_id
        LEFT JOIN test_assignments ta ON ta.id = a.test_assignment_id
        ORDER BY a.created_at DESC
      `);
  
      // ТЗ для выдачи (выпадающий список при смене статуса)
      // Или можно выдавать только те, у которых vacancy_id совпадает?
      // Но проще отдать все, пусть админ сам выбирает
      const [assignments] = await pool.query(
        `SELECT id, title, vacancy_id FROM test_assignments`
      );
  
      res.render('admin/applications', { apps, assignments });
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка при получении заявок');
    }
  };
  

module.exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId, status, testAssignmentId } = req.body;
    
    // Если нужно привязывать конкретное тестовое задание (testAssignmentId)
    await pool.query(
      'UPDATE applications SET status = ?, test_assignment_id = ? WHERE id = ?',
      [status, testAssignmentId || null, applicationId]
    );
    
    res.redirect('/admin/applications');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при обновлении статуса заявки');
  }
};

module.exports.getTestAssignments = async (req, res) => {
    try {
      const [assignments] = await pool.query(
        `SELECT ta.*, v.title AS vacancy_title 
         FROM test_assignments ta
         JOIN vacancies v ON v.id = ta.vacancy_id
         ORDER BY ta.id DESC`
      );
  
      // Получим список всех активных вакансий (или всех, как пожелаешь)
      const [vacancies] = await pool.query(
        'SELECT id, title FROM vacancies WHERE is_active = 1'
      );
  
      res.render('admin/testAssignments', { assignments, vacancies });
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка при получении ТЗ');
    }
  };
  

// Создание ТЗ
module.exports.createTestAssignment = async (req, res) => {
    try {
      const { vacancyId, title, assignmentText } = req.body; // <-- title
      await pool.query(
        'INSERT INTO test_assignments (vacancy_id, title, assignment_text) VALUES (?, ?, ?)',
        [vacancyId, title, assignmentText]
      );
      res.redirect('/admin/test-assignments');
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка при создании ТЗ');
    }
  };
  
  // Редактирование ТЗ
  module.exports.updateTestAssignment = async (req, res) => {
    try {
      const { id, vacancyId, title, assignmentText } = req.body; // <-- title
      await pool.query(
        'UPDATE test_assignments SET vacancy_id = ?, title = ?, assignment_text = ? WHERE id = ?',
        [vacancyId, title, assignmentText, id]
      );
      res.redirect('/admin/test-assignments');
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка при обновлении ТЗ');
    }
  };
  

module.exports.deleteTestAssignment = async (req, res) => {
  try {
    const { id } = req.body;
    await pool.query('DELETE FROM test_assignments WHERE id = ?', [id]);
    res.redirect('/admin/test-assignments');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при удалении ТЗ');
  }
};


// Показать форму редактирования
module.exports.editVacancyForm = async (req, res) => {
    try {
      const vacancyId = req.params.id;
      const [vacancies] = await pool.query('SELECT * FROM vacancies WHERE id = ?', [vacancyId]);
      if (vacancies.length === 0) {
        return res.status(404).send('Вакансия не найдена');
      }
      const vacancy = vacancies[0];
      res.render('admin/editVacancy', { vacancy });
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка при получении вакансии');
    }
  };
  
  // Обновить вакансию
  module.exports.updateVacancy = async (req, res) => {
    try {
      const { id, title, description, isActive } = req.body;
      await pool.query(
        'UPDATE vacancies SET title = ?, description = ?, is_active = ? WHERE id = ?',
        [title, description, isActive ? 1 : 0, id]
      );
      res.redirect('/admin/vacancies');
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка при обновлении вакансии');
    }
  };
  