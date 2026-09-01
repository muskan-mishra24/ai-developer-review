/**
 * Vector Database Service
 * Manages vector storage and similarity search using MongoDB
 */

const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')

// CodeVector Schema for storing embeddings
const codeVectorSchema = new mongoose.Schema({
  repositoryId: {
    type: String,
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  codeSnippet: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number],
    required: true
  },
  language: String,
  lineStart: Number,
  lineEnd: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Create index on repository ID for faster queries
codeVectorSchema.index({ repositoryId: 1, createdAt: -1 })

const CodeVector = mongoose.model('CodeVector', codeVectorSchema)

class VectorDatabaseService {
  constructor() {
    this.initialized = false
  }

  /**
   * Initialize vector database
   */
  async initialize() {
    try {
      // Verify connection
      if (mongoose.connection.readyState === 1) {
        this.initialized = true
        console.log('Vector database initialized (MongoDB)')
      }
    } catch (error) {
      console.error('Vector database initialization error:', error.message)
      throw error
    }
  }

  /**
   * Create indexes if not exists
   */
  async createTable() {
    try {
      await CodeVector.collection.createIndex({ repositoryId: 1 })
      await CodeVector.collection.createIndex({ repositoryId: 1, createdAt: -1 })
      console.log('Code vectors collection indexes created/verified')
    } catch (error) {
      console.error('Error creating indexes:', error.message)
      throw error
    }
  }

  /**
   * Store code embedding
   * @param {Object} data - Data to store
   * @returns {Promise<Object>} Stored record
   */
  async storeEmbedding(data) {
    try {
      const {
        repositoryId,
        fileName,
        codeSnippet,
        embedding,
        language,
        lineStart,
        lineEnd
      } = data

      const vector = new CodeVector({
        repositoryId,
        fileName,
        codeSnippet,
        embedding,
        language: language || 'unknown',
        lineStart: lineStart || null,
        lineEnd: lineEnd || null
      })

      await vector.save()
      return vector.toObject()
    } catch (error) {
      console.error('Error storing embedding:', error.message)
      throw error
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param {Array} vec1 - First vector
   * @param {Array} vec2 - Second vector
   * @returns {Number} Similarity score (0-1)
   */
  static cosineSimilarity(vec1, vec2) {
    if (vec1.length !== vec2.length) {
      return 0
    }

    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i]
      norm1 += vec1[i] * vec1[i]
      norm2 += vec2[i] * vec2[i]
    }

    norm1 = Math.sqrt(norm1)
    norm2 = Math.sqrt(norm2)

    if (norm1 === 0 || norm2 === 0) {
      return 0
    }

    return dotProduct / (norm1 * norm2)
  }

  /**
   * Search similar code by embedding
   * @param {Array} embedding - Query embedding
   * @param {String} repositoryId - Repository ID filter
   * @param {Number} limit - Number of results
   * @returns {Promise<Array>} Similar code snippets
   */
  async searchSimilar(embedding, repositoryId, limit = 5) {
    try {
      // Get all vectors for repository
      const vectors = await CodeVector.find({ repositoryId }).limit(100)

      // Calculate similarity for each
      const results = vectors.map(doc => {
        const similarity = VectorDatabaseService.cosineSimilarity(
          embedding,
          doc.embedding
        )
        return {
          ...doc.toObject(),
          similarity: Math.round(similarity * 100)
        }
      })

      // Sort by similarity and limit
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
    } catch (error) {
      console.error('Error searching similar:', error.message)
      throw error
    }
  }

  /**
   * Get all embeddings for a repository
   * @param {String} repositoryId - Repository ID
   * @returns {Promise<Array>} All code vectors
   */
  async getRepositoryEmbeddings(repositoryId) {
    try {
      const vectors = await CodeVector.find({ repositoryId }).sort({
        createdAt: -1
      })

      return vectors.map(v => v.toObject())
    } catch (error) {
      console.error('Error getting repository embeddings:', error.message)
      throw error
    }
  }

  /**
   * Delete embeddings for a repository
   * @param {String} repositoryId - Repository ID
   * @returns {Promise<Number>} Deleted count
   */
  async deleteRepositoryEmbeddings(repositoryId) {
    try {
      const result = await CodeVector.deleteMany({ repositoryId })
      return result.deletedCount
    } catch (error) {
      console.error('Error deleting embeddings:', error.message)
      throw error
    }
  }

  /**
   * Search by text query
   * @param {String} queryText - Search query text
   * @param {Array} queryEmbedding - Query embedding vector
   * @param {String} repositoryId - Repository ID filter
   * @param {Number} limit - Number of results
   * @returns {Promise<Array>} Search results
   */
  async search(queryText, queryEmbedding, repositoryId, limit = 10) {
    try {
      // Get all vectors for repository
      const vectors = await CodeVector.find({ repositoryId }).limit(200)

      // Calculate similarity for each
      const results = vectors
        .map(doc => {
          const similarity = VectorDatabaseService.cosineSimilarity(
            queryEmbedding,
            doc.embedding
          )
          return {
            id: doc._id,
            repository_id: doc.repositoryId,
            file_name: doc.fileName,
            code_snippet: doc.codeSnippet,
            language: doc.language,
            line_start: doc.lineStart,
            line_end: doc.lineEnd,
            similarity: Math.round(similarity * 100)
          }
        })
        .filter(r => r.similarity >= 30) // Filter by minimum similarity
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)

      return results
    } catch (error) {
      console.error('Error searching embeddings:', error.message)
      throw error
    }
  }

  /**
   * Close connection (no-op for MongoDB)
   */
  async close() {
    try {
      console.log('Vector database connection closed')
    } catch (error) {
      console.error('Error closing connection:', error.message)
    }
  }
}

module.exports = new VectorDatabaseService()
