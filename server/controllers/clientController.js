const Client = require('../models/Client');

// Get all clients with search
exports.getClients = async (req, res) => {
  try {
    const { search } = req.query;
    const query = search ? { 
      name: { $regex: search, $options: 'i' } 
    } : {};
    
    const clients = await Client.find(query).sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single client
exports.getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create client
exports.createClient = async (req, res) => {
  try {
    const client = new Client({
      name: req.body.name,
      telephone: req.body.telephone,
      numCarte: req.body.numCarte
    });

    const newClient = await client.save();
    res.status(201).json(newClient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update client
exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    client.name = req.body.name || client.name;
    client.telephone = req.body.telephone || client.telephone;
    client.numCarte = req.body.numCarte || client.numCarte;

    const updatedClient = await client.save();
    res.json(updatedClient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete client
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    await client.deleteOne();
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};