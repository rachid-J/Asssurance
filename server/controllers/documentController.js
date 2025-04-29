const Insurance = require('../models/Insurance');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Document = require('../models/Document'); // Assuming you have a Document model

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/documents';
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf', 
    'image/jpeg', 
    'image/png', 
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/tiff'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, PNG, DOC, DOCX and TIFF are allowed.'), false);
  }
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// Get all documents for a specific insurance
const getInsuranceDocuments = async (req, res) => {
  try {
    const { insuranceId } = req.params;
    
    // Verify insurance exists
    const insurance = await Insurance.findById(insuranceId);
    if (!insurance) {
      return res.status(404).json({ message: 'Insurance not found' });
    }
    
    const documents = await Document.find({ insurance: insuranceId })
      .sort({ createdAt: -1 });
    
    res.json(documents);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching documents', 
      error: error.message 
    });
  }
};

// Upload a new document
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { insuranceId } = req.params;
    const { name, type } = req.body;
    
    // Verify insurance exists
    const insurance = await Insurance.findById(insuranceId);
    if (!insurance) {
      // Remove uploaded file if insurance doesn't exist
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Insurance not found' });
    }
    
    // Create document record
    const document = new Document({
      name: name || req.file.originalname.split('.')[0],
      type: type || 'other',
      insurance: insuranceId,
      fileUrl: req.file.path,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      uploadedBy: req.user ? req.user._id : null
    });
    
    const savedDocument = await document.save();
    
    res.status(201).json(savedDocument);
  } catch (error) {
    // If there was an uploaded file, remove it in case of error
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: 'Error uploading document', 
      error: error.message 
    });
  }
};

// Delete a document
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Delete file from storage
    if (fs.existsSync(document.fileUrl)) {
      fs.unlinkSync(document.fileUrl);
    }
    
    // Delete document from database
    await Document.findByIdAndDelete(id);
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting document', 
      error: error.message 
    });
  }
};

// Download a document
const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    if (!fs.existsSync(document.fileUrl)) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    res.download(document.fileUrl, `${document.name}${path.extname(document.fileUrl)}`);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error downloading document', 
      error: error.message 
    });
  }
};

// Update document metadata
const updateDocumentMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    const updatedDocument = await Document.findByIdAndUpdate(
      id,
      { name, type },
      { new: true, runValidators: true }
    );
    
    res.json(updatedDocument);
  } catch (error) {
    res.status(400).json({ 
      message: 'Error updating document metadata', 
      error: error.message 
    });
  }
};

// Middleware to handle file upload
const handleFileUpload = (req, res, next) => {
  const uploadSingle = upload.single('document');
  
  uploadSingle(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size must be less than 10MB' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

module.exports = {
  getInsuranceDocuments,
  uploadDocument,
  deleteDocument,
  downloadDocument,
  updateDocumentMetadata,
  handleFileUpload
};