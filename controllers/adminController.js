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
    // Забираем все заявки со статусом "pending", например, или все
    const [apps] = await pool.query('SELECT * FROM applications WHERE status = "pending"');
    res.render('admin/applications', { apps });
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
       JOIN vacancies v ON v.id = ta.vacancy_id`
    );
    // assignments будут содержать данные и по вакансиям
    res.render('admin/testAssignments', { assignments });
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при получении ТЗ');
  }
};

module.exports.createTestAssignment = async (req, res) => {
  try {
    const { vacancyId, assignmentText } = req.body;
    await pool.query(
      'INSERT INTO test_assignments (vacancy_id, assignment_text) VALUES (?, ?)',
      [vacancyId, assignmentText]
    );
    res.redirect('/admin/test-assignments');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при создании ТЗ');
  }
};

module.exports.updateTestAssignment = async (req, res) => {
  try {
    const { id, vacancyId, assignmentText } = req.body;
    await pool.query(
      'UPDATE test_assignments SET vacancy_id = ?, assignment_text = ? WHERE id = ?',
      [vacancyId, assignmentText, id]
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
