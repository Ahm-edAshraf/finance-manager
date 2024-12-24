const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const auth = require('../middleware/auth');
const upload = require('../utils/fileUpload');

// All routes require authentication
router.use(auth);

// CRUD operations
router.post('/', expenseController.create);
router.get('/', expenseController.getAll);
router.get('/:id', expenseController.getById);
router.patch('/:id', expenseController.update);
router.delete('/:id', expenseController.delete);

// Additional features
router.post('/upload', upload.single('csv'), expenseController.uploadCSV);
router.get('/stats/summary', expenseController.getStats);
router.get('/insights/ml', expenseController.getInsights);

module.exports = router;
