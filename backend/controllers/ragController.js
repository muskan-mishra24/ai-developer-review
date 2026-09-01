/**
 * RAG Controller
 * Handles RAG-related API requests
 */

const ragService = require('../services/ragService')
const codeParserService = require('../services/codeParserService')
const Repository = require('../models/Repository')

const ragController = {
  /**
   * Index repository for RAG
   * POST /api/rag/index
   */
  indexRepository: async (req, res, next) => {
    try {
      const { repositoryId } = req.body

      if (!repositoryId) {
        return res.status(400).json({ error: 'Repository ID is required' })
      }

      // Verify user owns repository
      const repo = await Repository.findById(repositoryId)
      if (!repo || repo.userId.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' })
      }

      // TODO: Clone/fetch repository code
      // For now, accept files in request
      const { files } = req.body

      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: 'Files array is required' })
      }

      // Index the repository
      const results = await ragService.indexRepository(repositoryId, files)

      res.json({
        message: 'Repository indexed successfully',
        results
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Answer question about codebase
   * POST /api/rag/ask
   */
  askQuestion: async (req, res, next) => {
    try {
      const { question, repositoryId } = req.body

      if (!question || !repositoryId) {
        return res.status(400).json({ error: 'Question and repository ID are required' })
      }

      // Verify user owns repository
      const repo = await Repository.findById(repositoryId)
      if (!repo || repo.userId.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' })
      }

      const answer = await ragService.answerQuestion(question, repositoryId)

      res.json({
        question,
        answer: answer.answer,
        sources: answer.sources,
        confidence: answer.confidence
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Find similar code
   * POST /api/rag/find-similar
   */
  findSimilarCode: async (req, res, next) => {
    try {
      const { codeSnippet, repositoryId } = req.body

      if (!codeSnippet || !repositoryId) {
        return res.status(400).json({ error: 'Code snippet and repository ID are required' })
      }

      // Verify user owns repository
      const repo = await Repository.findById(repositoryId)
      if (!repo || repo.userId.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' })
      }

      const similarCode = await ragService.findSimilarCode(codeSnippet, repositoryId)

      res.json({
        query: codeSnippet.substring(0, 50) + '...',
        similarCode,
        count: similarCode.length
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Get code suggestions
   * POST /api/rag/suggestions
   */
  getSuggestions: async (req, res, next) => {
    try {
      const { query, repositoryId } = req.body

      if (!query || !repositoryId) {
        return res.status(400).json({ error: 'Query and repository ID are required' })
      }

      // Verify user owns repository
      const repo = await Repository.findById(repositoryId)
      if (!repo || repo.userId.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' })
      }

      const suggestions = await ragService.getSuggestions(query, repositoryId)

      res.json({
        query,
        suggestions,
        count: suggestions.length
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Explain code in context
   * GET /api/rag/explain/:repositoryId/:filePath
   */
  explainCode: async (req, res, next) => {
    try {
      const { repositoryId, filePath } = req.params

      // Verify user owns repository
      const repo = await Repository.findById(repositoryId)
      if (!repo || repo.userId.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' })
      }

      const explanation = await ragService.explainCodeInContext(filePath, repositoryId)

      res.json({
        file: filePath,
        explanation
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Get indexing status
   * GET /api/rag/status/:repositoryId
   */
  getStatus: async (req, res, next) => {
    try {
      const { repositoryId } = req.params

      // Verify user owns repository
      const repo = await Repository.findById(repositoryId)
      if (!repo || repo.userId.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' })
      }

      // TODO: Get actual indexing status from database
      res.json({
        repositoryId,
        status: 'indexed',
        message: 'Repository is ready for Q&A'
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = ragController
