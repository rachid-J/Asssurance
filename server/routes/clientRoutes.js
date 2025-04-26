const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const vehicleController = require('../controllers/vehicleController');


// Client routes
router
  .route('/clients')
  .get(clientController.getClients)
  .post(clientController.createClient);

router
  .route('/clients/:id')
  .get(clientController.getClient)
  .put(clientController.updateClient)
  .delete(clientController.deleteClient);

router.get('/clients/stats', clientController.getClientStats);

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
router.get('/vehicles/stats', vehicleController.getVehicleStats);




module.exports = router;