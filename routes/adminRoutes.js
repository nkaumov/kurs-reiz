// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Middleware для проверки роли admin
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.redirect('/auth/login');
}

// Дашборд
router.get('/dashboard', isAdmin, adminController.getDashboard);

// Управление вакансиями
router.get('/vacancies', isAdmin, adminController.getVacancies);
router.post('/vacancies/create', isAdmin, adminController.createVacancy);
router.get('/vacancies/edit/:id', isAdmin, adminController.editVacancyForm);
router.post('/vacancies/update', isAdmin, adminController.updateVacancy);
router.post('/vacancies/delete', isAdmin, adminController.deleteVacancy);


// Управление заявками
router.get('/applications', isAdmin, adminController.getApplications);
router.post('/applications/status', isAdmin, adminController.updateApplicationStatus);

// Управление тестовыми заданиями
router.get('/test-assignments', isAdmin, adminController.getTestAssignments);
router.post('/test-assignments/create', isAdmin, adminController.createTestAssignment);
router.post('/test-assignments/update', isAdmin, adminController.updateTestAssignment);
router.post('/test-assignments/delete', isAdmin, adminController.deleteTestAssignment);

module.exports = router;
