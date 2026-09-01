/**
 * Code Review Service
 * Handles AI-powered code analysis and review operations
 */

const llmService = require('./llmService')
const { generateCodeAnalysisPrompt } = require('./prompts')

const codeReviewService = {
  /**
   * Analyze code for issues
   * @param {Object} codeContent - The code to analyze
   * @param {String} language - Programming language
   * @returns {Promise<Object>} Analysis results with issues
   */
  analyzeCode: async (codeContent, language = 'javascript') => {
    try {
      // Generate analysis prompt
      const prompt = generateCodeAnalysisPrompt(codeContent, 'comprehensive', language)
      
      // Get analysis from LLM
      const analysis = await llmService.analyzeCode(codeContent, language, 'all')
      
      return {
        issues: analysis.issues || [],
        codeQualityScore: analysis.codeQualityScore || 70,
        summary: analysis.summary || 'Code analysis completed'
      }
    } catch (error) {
      console.error('Error analyzing code:', error)
      throw error
    }
  },

  /**
   * Detect bugs in code
   * @param {Object} codeContent - The code to check
   * @param {String} language - Programming language
   * @returns {Promise<Array>} Array of detected bugs
   */
  detectBugs: async (codeContent, language = 'javascript') => {
    try {
      const analysis = await llmService.analyzeCode(codeContent, language, 'bugs')
      
      // Filter only bug-type issues
      const bugs = (analysis.issues || []).filter(issue => issue.type === 'bug')
      
      return bugs
    } catch (error) {
      console.error('Error detecting bugs:', error)
      throw error
    }
  },

  /**
   * Check for security vulnerabilities
   * @param {Object} codeContent - The code to check
   * @param {String} language - Programming language
   * @returns {Promise<Array>} Array of security issues
   */
  checkSecurity: async (codeContent, language = 'javascript') => {
    try {
      const analysis = await llmService.analyzeCode(codeContent, language, 'security')
      
      // Filter only security-type issues
      const vulnerabilities = (analysis.issues || []).filter(issue => issue.type === 'security')
      
      return vulnerabilities
    } catch (error) {
      console.error('Error checking security:', error)
      throw error
    }
  },

  /**
   * Analyze performance issues
   * @param {Object} codeContent - The code to analyze
   * @param {String} language - Programming language
   * @returns {Promise<Array>} Array of performance issues
   */
  analyzePerformance: async (codeContent, language = 'javascript') => {
    try {
      const analysis = await llmService.analyzeCode(codeContent, language, 'performance')
      
      // Filter only performance-type issues
      const performanceIssues = (analysis.issues || []).filter(issue => issue.type === 'performance')
      
      return performanceIssues
    } catch (error) {
      console.error('Error analyzing performance:', error)
      throw error
    }
  },

  /**
   * Generate refactoring suggestions
   * @param {Object} codeContent - The code to refactor
   * @param {String} language - Programming language
   * @returns {Promise<Array>} Array of refactoring suggestions
   */
  generateRefactoringSuggestions: async (codeContent, language = 'javascript') => {
    try {
      const analysis = await llmService.analyzeCode(codeContent, language, 'quality')
      
      // Filter only refactoring-type issues
      const suggestions = (analysis.issues || []).filter(issue => issue.type === 'refactoring')
      
      return suggestions
    } catch (error) {
      console.error('Error generating refactoring suggestions:', error)
      throw error
    }
  },

  /**
   * Generate test cases for code
   * @param {String} code - Code to generate tests for
   * @param {String} language - Programming language
   * @returns {Promise<String>} Generated test code
   */
  generateTests: async (code, language = 'javascript') => {
    try {
      const testCode = await llmService.generateTestCases(code, language)
      return testCode
    } catch (error) {
      console.error('Error generating tests:', error)
      throw error
    }
  },

  /**
   * Generate documentation for code
   * @param {String} code - Code to document
   * @param {String} language - Programming language
   * @returns {Promise<String>} Generated documentation
   */
  generateDocumentation: async (code, language = 'javascript') => {
    try {
      const documentation = await llmService.generateDocumentation(code, language)
      return documentation
    } catch (error) {
      console.error('Error generating documentation:', error)
      throw error
    }
  },

  /**
   * Perform comprehensive code review
   * @param {Array<{file: String, code: String, language: String}>} files - Files to review
   * @returns {Promise<Object>} Comprehensive review results
   */
  performComprehensiveReview: async (files) => {
    try {
      const allIssues = []
      let totalQualityScore = 0
      
      for (const file of files) {
        const analysis = await codeReviewService.analyzeCode(file.code, file.language)
        
        // Add file name to each issue
        const fileIssues = (analysis.issues || []).map(issue => ({
          ...issue,
          file: file.file
        }))
        
        allIssues.push(...fileIssues)
        totalQualityScore += analysis.codeQualityScore || 0
      }
      
      const averageScore = files.length > 0 ? Math.round(totalQualityScore / files.length) : 0
      
      // Group issues by severity
      const issueBySeverity = {
        critical: allIssues.filter(i => i.severity === 'critical').length,
        high: allIssues.filter(i => i.severity === 'high').length,
        medium: allIssues.filter(i => i.severity === 'medium').length,
        low: allIssues.filter(i => i.severity === 'low').length
      }
      
      return {
        filesAnalyzed: files.length,
        codeQualityScore: averageScore,
        totalIssues: allIssues.length,
        issueBySeverity,
        issues: allIssues,
        summary: `Code review completed. Found ${allIssues.length} issues across ${files.length} files.`
      }
    } catch (error) {
      console.error('Error performing comprehensive review:', error)
      throw error
    }
  }
}

export default codeReviewService
module.exports = codeReviewService
