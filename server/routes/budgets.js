const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// CRUD operations
router.post('/', budgetController.create);
router.get('/', budgetController.getAll);
router.get('/:id', budgetController.getById);
router.patch('/:id', budgetController.update);
router.delete('/:id', budgetController.delete);

// Additional features
router.get('/check/alerts', budgetController.checkAlerts);

module.exports = router;
