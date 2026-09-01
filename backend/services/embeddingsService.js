/**
 * Embeddings Service
 * Generates vector embeddings for code using OpenAI
 */

const { OpenAI } = require('openai')

class EmbeddingsService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    this.model = process.env.EMBEDDINGS_MODEL || 'text-embedding-3-small'
  }

  /**
   * Generate embedding for text
   * @param {String} text - Text to embed
   * @returns {Promise<Array>} Vector embedding
   */
  async generateEmbedding(text) {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Text content is required for embedding')
      }

      // Truncate text if too long (model has limits)
      const truncatedText = text.substring(0, 8000)

      const response = await this.client.embeddings.create({
        model: this.model,
        input: truncatedText,
        encoding_format: 'float'
      })

      if (!response.data || response.data.length === 0) {
        throw new Error('No embedding returned from API')
      }

      return response.data[0].embedding
    } catch (error) {
      console.error('Error generating embedding:', error.message)
      throw new Error(`Failed to generate embedding: ${error.message}`)
    }
  }

  /**
   * Generate embeddings for multiple texts
   * @param {Array<String>} texts - Texts to embed
   * @returns {Promise<Array>} Array of embeddings
   */
  async generateEmbeddings(texts) {
    try {
      const embeddings = []
      
      // Process in batches to avoid rate limits
      const batchSize = 20
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize)
        
        for (const text of batch) {
          const embedding = await this.generateEmbedding(text)
          embeddings.push(embedding)
        }
      }

      return embeddings
    } catch (error) {
      console.error('Error generating embeddings:', error.message)
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
      throw new Error('Vectors must have same length')
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
   * Check if embedding service is available
   * @returns {Promise<Boolean>}
   */
  async isAvailable() {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return false
      }

      // Try generating a simple embedding
      await this.generateEmbedding('test')
      return true
    } catch (error) {
      console.error('Embedding service check failed:', error.message)
      return false
    }
  }
}

module.exports = new EmbeddingsService()
