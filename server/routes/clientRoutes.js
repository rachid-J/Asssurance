const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');


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


module.exports = router;