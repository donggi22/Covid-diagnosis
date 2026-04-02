const express = require('express');
const patientController = require('../controllers/patientController');
// const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', patientController.getPatients);
router.get('/:id', patientController.getPatientById);
router.post('/', patientController.createPatient);
router.put('/:id', patientController.updatePatient);
router.delete('/:id', patientController.deletePatient);

module.exports = router;
