const OpenAI = require('openai')

class LLMService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    this.model = process.env.LLM_MODEL || 'gpt-4-turbo-preview'
    this.maxTokens = parseInt(process.env.LLM_MAX_TOKENS) || 2000
  }

  /**
   * Send a message to the LLM and get a response
   * @param {String} prompt - The prompt to send
   * @param {Number} maxTokens - Max tokens for response
   * @returns {Promise<String>} LLM response
   */
  async generateCompletion(prompt, maxTokens = this.maxTokens) {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert code reviewer and software engineer. Provide detailed, actionable feedback.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
        top_p: 0.9
      })

      return response.choices[0].message.content
    } catch (error) {
      console.error('LLM API Error:', error.message)
      throw new Error(`Failed to generate completion: ${error.message}`)
    }
  }

  /**
   * Analyze code and return structured feedback
   * @param {String} code - Code to analyze
   * @param {String} language - Programming language
   * @param {String} analysisType - Type of analysis (bugs, security, performance, quality, all)
   * @returns {Promise<Object>} Structured analysis result
   */
  async analyzeCode(code, language = 'javascript', analysisType = 'all') {
    try {
      let analysisPrompt = this.getAnalysisPrompt(code, language, analysisType)
      const response = await this.generateCompletion(analysisPrompt)
      
      // Parse JSON response
      const parsed = JSON.parse(response)
      return parsed
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error('Failed to parse LLM response as JSON:', error.message)
        // Return structured error response
        return {
          issues: [],
          codeQualityScore: 0,
          summary: 'Error parsing analysis. Please try again.'
        }
      }
      throw error
    }
  }

  /**
   * Get analysis prompt based on analysis type
   * @private
   */
  getAnalysisPrompt(code, language, analysisType) {
    const basePrompt = `Analyze the following ${language} code and provide a detailed review in JSON format.

Code:
\`\`\`${language}
${code}
\`\`\`

Respond with a JSON object containing:
{
  "issues": [
    {
      "type": "bug|security|performance|code_quality|refactoring|testing|documentation",
      "severity": "critical|high|medium|low|info",
      "title": "Issue title",
      "description": "Detailed description",
      "suggestion": "How to fix it",
      "codeSnippet": "Example code"
    }
  ],
  "codeQualityScore": 0-100,
  "summary": "Overall review summary"
}

Focus areas:`

    const focusMap = {
      'bugs': 'Look for logical errors, null pointer exceptions, edge cases, and incorrect logic.',
      'security': 'Focus on security vulnerabilities like SQL injection, XSS, authentication issues, and data exposure.',
      'performance': 'Identify performance bottlenecks, inefficient algorithms, memory leaks, and optimization opportunities.',
      'quality': 'Assess code maintainability, readability, naming conventions, and architecture patterns.',
      'testing': 'Check for missing tests, insufficient test coverage, and testability issues.',
      'documentation': 'Review code documentation, comments, and API documentation completeness.',
      'all': 'Provide comprehensive analysis covering bugs, security, performance, code quality, testing, and documentation.'
    }

    const focus = focusMap[analysisType] || focusMap['all']
    return basePrompt + '\n' + focus
  }

  /**
   * Generate test cases for code
   * @param {String} code - Code to generate tests for
   * @param {String} language - Programming language
   * @returns {Promise<String>} Generated test code
   */
  async generateTestCases(code, language = 'javascript') {
    const prompt = `Generate comprehensive test cases for the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Provide test cases in a popular testing framework for ${language} (Jest for JS, pytest for Python, etc.).
Include tests for normal cases, edge cases, and error scenarios.`

    return this.generateCompletion(prompt, 3000)
  }

  /**
   * Generate documentation for code
   * @param {String} code - Code to document
   * @param {String} language - Programming language
   * @returns {Promise<String>} Generated documentation
   */
  async generateDocumentation(code, language = 'javascript') {
    const prompt = `Generate comprehensive documentation for the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Include:
1. Function/class descriptions
2. Parameter documentation
3. Return value documentation
4. Usage examples
5. Edge cases and exceptions

Format in JSDoc/Docstring style appropriate for ${language}.`

    return this.generateCompletion(prompt, 2500)
  }

  /**
   * Refactor code with AI suggestions
   * @param {String} code - Code to refactor
   * @param {String} language - Programming language
   * @param {String} goal - Refactoring goal (readability, performance, maintainability)
   * @returns {Promise<String>} Refactored code
   */
  async refactorCode(code, language = 'javascript', goal = 'maintainability') {
    const goalMap = {
      'readability': 'improve code readability and clarity',
      'performance': 'optimize for better performance',
      'maintainability': 'improve maintainability and follow best practices',
      'testing': 'make code more testable'
    }

    const goalDescription = goalMap[goal] || goalMap['maintainability']

    const prompt = `Refactor the following ${language} code to ${goalDescription}:

\`\`\`${language}
${code}
\`\`\`

Provide only the refactored code without explanations.`

    return this.generateCompletion(prompt, 3000)
  }

  /**
   * Explain code functionality
   * @param {String} code - Code to explain
   * @param {String} language - Programming language
   * @returns {Promise<String>} Code explanation
   */
  async explainCode(code, language = 'javascript') {
    const prompt = `Explain what the following ${language} code does in simple terms:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. Overall purpose
2. How it works step by step
3. Key algorithms or patterns used
4. Performance characteristics`

    return this.generateCompletion(prompt, 1500)
  }

  /**
   * Check if API key is valid
   * @returns {Promise<Boolean>}
   */
  async validateApiKey() {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return false
      }
      
      // Try a simple API call
      await this.client.models.list()
      return true
    } catch (error) {
      console.error('API Key validation failed:', error.message)
      return false
    }
  }
}

export default new LLMService()
module.exports = new LLMService()
