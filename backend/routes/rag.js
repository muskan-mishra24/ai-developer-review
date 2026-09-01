const express = require('express')
const ragController = require('../controllers/ragController')

const router = express.Router()

// RAG endpoints
router.post('/index', ragController.indexRepository)
router.post('/ask', ragController.askQuestion)
router.post('/find-similar', ragController.findSimilarCode)
router.post('/suggestions', ragController.getSuggestions)
router.get('/explain/:repositoryId/:filePath', ragController.explainCode)
router.get('/status/:repositoryId', ragController.getStatus)

module.exports = router
