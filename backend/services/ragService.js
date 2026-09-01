/**
 * RAG Service
 * Implements Retrieval-Augmented Generation for code Q&A
 */

const llmService = require('./llmService')
const embeddingsService = require('./embeddingsService')
const vectorDatabaseService = require('./vectorDatabaseService')
const codeParserService = require('./codeParserService')

const ragService = {
  /**
   * Index repository code for RAG
   * @param {String} repositoryId - Repository ID
   * @param {Array} files - Code files to index
   * @returns {Promise<Object>} Indexing results
   */
  indexRepository: async (repositoryId, files) => {
    try {
      const results = {
        indexed: 0,
        failed: 0,
        errors: []
      }

      // Split code into chunks
      const chunks = []
      for (const file of files) {
        const fileChunks = ragService.splitCode(file.code, file.file, file.language)
        chunks.push(...fileChunks)
      }

      // Generate embeddings for each chunk
      for (const chunk of chunks) {
        try {
          const embedding = await embeddingsService.generateEmbedding(chunk.code)

          await vectorDatabaseService.storeEmbedding({
            repositoryId,
            fileName: chunk.file,
            codeSnippet: chunk.code,
            embedding,
            language: chunk.language,
            lineStart: chunk.lineStart,
            lineEnd: chunk.lineEnd
          })

          results.indexed++
        } catch (error) {
          results.failed++
          results.errors.push(`Failed to index ${chunk.file}: ${error.message}`)
          console.error(`Error indexing ${chunk.file}:`, error.message)
        }
      }

      return results
    } catch (error) {
      console.error('Error indexing repository:', error.message)
      throw error
    }
  },

  /**
   * Split code into overlapping chunks
   * @param {String} code - Code content
   * @param {String} fileName - File name
   * @param {String} language - Programming language
   * @param {Number} chunkSize - Lines per chunk
   * @param {Number} overlap - Overlapping lines
   * @returns {Array} Code chunks
   */
  splitCode: (code, fileName, language = 'unknown', chunkSize = 50, overlap = 10) => {
    const lines = code.split('\n')
    const chunks = []
    let lineNum = 1

    for (let i = 0; i < lines.length; i += chunkSize - overlap) {
      const end = Math.min(i + chunkSize, lines.length)
      const chunkLines = lines.slice(i, end)

      if (chunkLines.length > 0) {
        chunks.push({
          code: chunkLines.join('\n'),
          file: fileName,
          language,
          lineStart: lineNum,
          lineEnd: lineNum + chunkLines.length - 1
        })
      }

      lineNum += chunkSize - overlap
    }

    return chunks
  },

  /**
   * Answer question about codebase using RAG
   * @param {String} question - User question
   * @param {String} repositoryId - Repository ID
   * @returns {Promise<Object>} Answer with context
   */
  answerQuestion: async (question, repositoryId) => {
    try {
      // Generate embedding for question
      const questionEmbedding = await embeddingsService.generateEmbedding(question)

      // Search for relevant code
      const relevantCode = await vectorDatabaseService.search(
        question,
        questionEmbedding,
        repositoryId,
        5
      )

      if (relevantCode.length === 0) {
        return {
          answer: "I couldn't find relevant code snippets to answer your question. Try asking about specific functions or features in the codebase.",
          sources: [],
          confidence: 0
        }
      }

      // Build context from relevant code
      const context = ragService.buildContext(relevantCode)

      // Generate answer using LLM
      const prompt = `Based on the following code context from a software project, answer this question: "${question}"

Context:
${context}

Provide a clear, concise answer based only on the code provided.`

      const answer = await llmService.generateCompletion(prompt, 1000)

      return {
        answer,
        sources: relevantCode.map(r => ({
          file: r.file_name,
          similarity: r.similarity,
          lineStart: r.line_start,
          lineEnd: r.line_end
        })),
        confidence: Math.min(relevantCode[0]?.similarity || 0, 100)
      }
    } catch (error) {
      console.error('Error answering question:', error.message)
      throw error
    }
  },

  /**
   * Build context string from code snippets
   * @param {Array} snippets - Code snippets
   * @returns {String} Formatted context
   */
  buildContext: (snippets) => {
    let context = ''

    snippets.forEach((snippet, index) => {
      context += `\n--- Code Snippet ${index + 1} ---`
      context += `\nFile: ${snippet.file_name}`
      context += `\nLanguage: ${snippet.language}`
      context += `\nLines: ${snippet.line_start}-${snippet.line_end}`
      context += `\nRelevance: ${snippet.similarity}%`
      context += `\n\`\`\`${snippet.language || 'text'}\n`
      context += snippet.code_snippet
      context += `\n\`\`\`\n`
    })

    return context
  },

  /**
   * Find code similar to provided snippet
   * @param {String} codeSnippet - Code to find similar code for
   * @param {String} repositoryId - Repository ID
   * @param {Number} limit - Number of results
   * @returns {Promise<Array>} Similar code snippets
   */
  findSimilarCode: async (codeSnippet, repositoryId, limit = 5) => {
    try {
      const embedding = await embeddingsService.generateEmbedding(codeSnippet)
      const similarCode = await vectorDatabaseService.search(
        codeSnippet,
        embedding,
        repositoryId,
        limit
      )

      return similarCode.map(code => ({
        file: code.file_name,
        similarity: code.similarity,
        code: code.code_snippet,
        language: code.language
      }))
    } catch (error) {
      console.error('Error finding similar code:', error.message)
      throw error
    }
  },

  /**
   * Get code suggestions based on query
   * @param {String} query - Search query
   * @param {String} repositoryId - Repository ID
   * @returns {Promise<Array>} Code suggestions
   */
  getSuggestions: async (query, repositoryId) => {
    try {
      const embedding = await embeddingsService.generateEmbedding(query)
      const suggestions = await vectorDatabaseService.search(
        query,
        embedding,
        repositoryId,
        10
      )

      return suggestions.map(s => ({
        file: s.file_name,
        relevance: s.similarity,
        snippet: s.code_snippet.substring(0, 200) + '...',
        lines: `${s.line_start}-${s.line_end}`
      }))
    } catch (error) {
      console.error('Error getting suggestions:', error.message)
      throw error
    }
  },

  /**
   * Explain code using RAG context
   * @param {String} filePath - File path to explain
   * @param {String} repositoryId - Repository ID
   * @returns {Promise<String>} Explanation
   */
  explainCodeInContext: async (filePath, repositoryId) => {
    try {
      // Get similar code for context
      const relevantCode = await vectorDatabaseService.getRepositoryEmbeddings(repositoryId)
      const thisFile = relevantCode.filter(c => c.file_name === filePath).slice(0, 3)

      if (thisFile.length === 0) {
        return 'File not found in repository index'
      }

      const context = ragService.buildContext(thisFile)
      const prompt = `Provide a detailed explanation of what this code does and how it fits into the overall architecture:

${context}`

      return await llmService.generateCompletion(prompt, 1500)
    } catch (error) {
      console.error('Error explaining code:', error.message)
      throw error
    }
  },

  /**
   * Initialize RAG system
   */
  initialize: async () => {
    try {
      console.log('Initializing RAG system...')
      await vectorDatabaseService.initialize()
      await vectorDatabaseService.createTable()
      const embeddingsAvailable = await embeddingsService.isAvailable()
      
      if (!embeddingsAvailable) {
        console.warn('Embeddings service not available - check OpenAI API key')
      }

      console.log('RAG system initialized successfully')
      return true
    } catch (error) {
      console.error('Error initializing RAG:', error.message)
      return false
    }
  }
}

module.exports = ragService
