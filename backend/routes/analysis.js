const express = require('express')
const codeAnalysisController = require('../controllers/codeAnalysisController')

const router = express.Router()

// Code analysis endpoints
router.post('/analyze', codeAnalysisController.analyzeCode)
router.post('/bugs', codeAnalysisController.detectBugs)
router.post('/security', codeAnalysisController.checkSecurity)
router.post('/performance', codeAnalysisController.analyzePerformance)
router.post('/refactor', codeAnalysisController.generateRefactoring)
router.post('/tests', codeAnalysisController.generateTests)
router.post('/docs', codeAnalysisController.generateDocumentation)
router.post('/comprehensive', codeAnalysisController.comprehensiveReview)

module.exports = router
