const express = require('express');
const router = express.Router();
const assuranceCaseController = require('../controllers/assuranceCaseController');

// Get all cases
router.get('/', assuranceCaseController.getCases);

// Get single case
router.get('/:id', assuranceCaseController.getCase);

// Create new case
router.post('/', assuranceCaseController.createCase);

// Update case
router.put('/:id', assuranceCaseController.updateCase);

// Delete case
router.delete('/:id', assuranceCaseController.deleteCase);

// Add advance payment
router.post('/:id/advances', assuranceCaseController.addAdvance);

module.exports = router;