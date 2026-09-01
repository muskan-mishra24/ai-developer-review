const codeReviewService = require('../services/codeReviewService')
const { REVIEW_STATUS } = require('../config/constants')
const Review = require('../models/Review')

const codeAnalysisController = {
  /**
   * Analyze code and create a review
   * POST /api/analysis/analyze
   */
  analyzeCode: async (req, res, next) => {
    try {
      const { code, language = 'javascript', repositoryId } = req.body

      if (!code) {
        return res.status(400).json({ error: 'Code content is required' })
      }

      // Perform analysis
      const analysis = await codeReviewService.analyzeCode(code, language)

      // Create review record
      const review = new Review({
        repositoryId: repositoryId || null,
        userId: req.user.userId,
        status: REVIEW_STATUS.COMPLETED,
        issues: analysis.issues || [],
        codeQualityScore: analysis.codeQualityScore || 0,
        summary: analysis.summary,
        filesAnalyzed: 1,
        totalIssues: (analysis.issues || []).length
      })

      await review.save()

      res.status(201).json({
        message: 'Code analysis completed',
        review: review.toObject()
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Detect bugs in code
   * POST /api/analysis/bugs
   */
  detectBugs: async (req, res, next) => {
    try {
      const { code, language = 'javascript' } = req.body

      if (!code) {
        return res.status(400).json({ error: 'Code content is required' })
      }

      const bugs = await codeReviewService.detectBugs(code, language)

      res.json({
        bugs,
        count: bugs.length
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Check security vulnerabilities
   * POST /api/analysis/security
   */
  checkSecurity: async (req, res, next) => {
    try {
      const { code, language = 'javascript' } = req.body

      if (!code) {
        return res.status(400).json({ error: 'Code content is required' })
      }

      const vulnerabilities = await codeReviewService.checkSecurity(code, language)

      res.json({
        vulnerabilities,
        count: vulnerabilities.length,
        critical: vulnerabilities.filter(v => v.severity === 'critical').length,
        high: vulnerabilities.filter(v => v.severity === 'high').length
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Analyze performance issues
   * POST /api/analysis/performance
   */
  analyzePerformance: async (req, res, next) => {
    try {
      const { code, language = 'javascript' } = req.body

      if (!code) {
        return res.status(400).json({ error: 'Code content is required' })
      }

      const issues = await codeReviewService.analyzePerformance(code, language)

      res.json({
        issues,
        count: issues.length
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Generate refactoring suggestions
   * POST /api/analysis/refactor
   */
  generateRefactoring: async (req, res, next) => {
    try {
      const { code, language = 'javascript' } = req.body

      if (!code) {
        return res.status(400).json({ error: 'Code content is required' })
      }

      const suggestions = await codeReviewService.generateRefactoringSuggestions(code, language)

      res.json({
        suggestions,
        count: suggestions.length
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Generate test cases
   * POST /api/analysis/tests
   */
  generateTests: async (req, res, next) => {
    try {
      const { code, language = 'javascript' } = req.body

      if (!code) {
        return res.status(400).json({ error: 'Code content is required' })
      }

      const testCode = await codeReviewService.generateTests(code, language)

      res.json({
        tests: testCode
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Generate documentation
   * POST /api/analysis/docs
   */
  generateDocumentation: async (req, res, next) => {
    try {
      const { code, language = 'javascript' } = req.body

      if (!code) {
        return res.status(400).json({ error: 'Code content is required' })
      }

      const documentation = await codeReviewService.generateDocumentation(code, language)

      res.json({
        documentation
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Perform comprehensive review on multiple files
   * POST /api/analysis/comprehensive
   */
  comprehensiveReview: async (req, res, next) => {
    try {
      const { files, repositoryId } = req.body

      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: 'Files array is required' })
      }

      // Validate file structure
      files.forEach((file, index) => {
        if (!file.code || !file.file) {
          throw new Error(`File ${index} missing required fields (code, file)`)
        }
      })

      // Perform comprehensive review
      const results = await codeReviewService.performComprehensiveReview(files)

      // Create review record
      const review = new Review({
        repositoryId: repositoryId || null,
        userId: req.user.userId,
        status: REVIEW_STATUS.COMPLETED,
        issues: results.issues || [],
        codeQualityScore: results.codeQualityScore || 0,
        summary: results.summary,
        filesAnalyzed: results.filesAnalyzed,
        totalIssues: results.totalIssues
      })

      await review.save()

      res.status(201).json({
        message: 'Comprehensive review completed',
        review: review.toObject()
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = codeAnalysisController
