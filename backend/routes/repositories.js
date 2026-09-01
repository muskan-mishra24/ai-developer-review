const express = require('express');
const repositoryController = require('../controllers/repositoryController');

const router = express.Router();

router.post('/', repositoryController.create);
router.get('/', repositoryController.getAll);
router.get('/:id', repositoryController.getById);
router.put('/:id', repositoryController.update);
router.delete('/:id', repositoryController.delete);

module.exports = router;
