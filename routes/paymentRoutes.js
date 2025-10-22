const express = require('express');
const Payment = require('../models/Payment');
const createCrudController = require('../controllers/crudController');

const router = express.Router();
const ctrl = createCrudController(Payment);

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;

