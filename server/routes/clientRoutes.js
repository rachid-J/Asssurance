const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const vehicleController = require('../controllers/vehicleController');

// Client statistics route - place BEFORE the :id route to avoid conflicts
router.get('/clients/stats', clientController.getClientStats);

// Client routes
router
  .route('/')
  .get(clientController.getClients)
  .post(clientController.createClient);

router
  .route('/:id')
  .get(clientController.getClient)
  .put(clientController.updateClient)
  .delete(clientController.deleteClient);

// Vehicle statistics route - place BEFORE the :id route
router.get('/vehicles/stats', vehicleController.getVehicleStats);

// Vehicle routes
router
  .route('/vehicles')
  .get(vehicleController.getVehicles)
  .post(vehicleController.createVehicle);

router
  .route('/vehicles/:id')
  .get(vehicleController.getVehicle)
  .put(vehicleController.updateVehicle)
  .delete(vehicleController.deleteVehicle);

router.post('/vehicles/:id/documents', vehicleController.addVehicleDocument);

module.exports = router;