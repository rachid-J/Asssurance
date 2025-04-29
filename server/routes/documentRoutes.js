const express = require('express');
const {
  getInsuranceDocuments,
  uploadDocument,
  deleteDocument,
  downloadDocument,
  updateDocumentMetadata,
  handleFileUpload
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);
// Insurance document routes
router.get('/:insuranceId/insurances',protect , getInsuranceDocuments);
router.post('/:insuranceId/insurances', protect ,handleFileUpload, uploadDocument);

// Document-specific routes
router.route('/documents/:id')
  .put(updateDocumentMetadata)
  .delete(deleteDocument);

router.get('/:id/download',protect ,downloadDocument);

module.exports = router;