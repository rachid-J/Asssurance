const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const upload = require('../middleware/uploadMiddleware');

router.get('/vehicles/stats', vehicleController.getVehicleStats);

// Vehicle routes
router
  .route('/')
  .get(vehicleController.getVehicles)
  .post(vehicleController.createVehicle)


router
  .route('/:id')
  .get(vehicleController.getVehicle)
  .put(vehicleController.updateVehicle)
  .delete(vehicleController.deleteVehicle);
 
  router.post('/:id/documents', upload.single('documentFile'), vehicleController.addDocument);
  router.get('/:vehicleId/documents/:documentId',  vehicleController.getVehicleDocument);
  router.delete('/:vehicleId/documents/:documentId',  vehicleController.deleteVehicleDocument);
module.exports = router;