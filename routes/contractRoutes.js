const express = require('express');
const SalesContract = require('../models/SalesContract');
const createCrudController = require('../controllers/crudController');

const router = express.Router();
const ctrl = createCrudController(SalesContract);

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;

