/**
 * Code Parser Service
 * Extracts and parses code from various sources
 */

const fs = require('fs').promises
const path = require('path')

const codeParserService = {
  /**
   * Parse code from a file
   * @param {String} filePath - Path to the file
   * @returns {Promise<Object>} Parsed code with metadata
   */
  parseFile: async (filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const extension = path.extname(filePath).toLowerCase()

      return {
        file: filePath,
        code: content,
        language: codeParserService.getLanguageFromExtension(extension),
        lines: content.split('\n').length,
        size: content.length
      }
    } catch (error) {
      console.error(`Error parsing file ${filePath}:`, error.message)
      throw error
    }
  },

  /**
   * Parse multiple files from a directory
   * @param {String} dirPath - Path to directory
   * @param {Array<String>} extensions - File extensions to parse (default: common code files)
   * @returns {Promise<Array>} Array of parsed files
   */
  parseDirectory: async (dirPath, extensions = ['.js', '.ts', '.py', '.java', '.cpp', '.go']) => {
    try {
      const files = []
      const entries = await fs.readdir(dirPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)

        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          // Recursively parse subdirectories
          const subFiles = await codeParserService.parseDirectory(fullPath, extensions)
          files.push(...subFiles)
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase()
          if (extensions.includes(ext)) {
            const parsed = await codeParserService.parseFile(fullPath)
            files.push(parsed)
          }
        }
      }

      return files
    } catch (error) {
      console.error(`Error parsing directory ${dirPath}:`, error.message)
      throw error
    }
  },

  /**
   * Extract functions/classes from code
   * @param {String} code - Code content
   * @param {String} language - Programming language
   * @returns {Array} Array of function/class definitions
   */
  extractFunctions: (code, language = 'javascript') => {
    const functions = []

    if (language === 'javascript' || language === 'typescript') {
      // Match function declarations and arrow functions
      const patterns = [
        /function\s+(\w+)\s*\([^)]*\)\s*{/g,  // function declarations
        /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g, // arrow functions
        /class\s+(\w+)/g                         // class declarations
      ]

      patterns.forEach(pattern => {
        let match
        while ((match = pattern.exec(code)) !== null) {
          functions.push({
            name: match[1],
            type: match[0].includes('class') ? 'class' : 'function',
            start: match.index
          })
        }
      })
    } else if (language === 'python') {
      // Match Python functions and classes
      const patterns = [
        /def\s+(\w+)\s*\(/g,    // functions
        /class\s+(\w+)/g         // classes
      ]

      patterns.forEach(pattern => {
        let match
        while ((match = pattern.exec(code)) !== null) {
          functions.push({
            name: match[1],
            type: match[0].includes('class') ? 'class' : 'function',
            start: match.index
          })
        }
      })
    } else if (language === 'java') {
      // Match Java methods and classes
      const patterns = [
        /(?:public|private|protected)?\s+(?:static)?\s+\w+\s+(\w+)\s*\(/g,
        /class\s+(\w+)/g
      ]

      patterns.forEach(pattern => {
        let match
        while ((match = pattern.exec(code)) !== null) {
          functions.push({
            name: match[1],
            type: match[0].includes('class') ? 'class' : 'method',
            start: match.index
          })
        }
      })
    }

    return functions
  },

  /**
   * Get cyclomatic complexity of code
   * @param {String} code - Code content
   * @returns {Number} Complexity score
   */
  getComplexity: (code) => {
    // Simple complexity calculation based on control flow statements
    const operators = [
      'if', 'else', 'switch', 'case',
      'for', 'while', 'do',
      '&&', '||', '?',
      'catch', 'throw'
    ]

    let complexity = 1
    operators.forEach(op => {
      const regex = new RegExp(`\\b${op}\\b|${op}`, 'g')
      const matches = code.match(regex) || []
      complexity += matches.length
    })

    return Math.min(complexity, 100) // Cap at 100
  },

  /**
   * Get language from file extension
   * @private
   */
  getLanguageFromExtension: (ext) => {
    const languageMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.go': 'go',
      '.rb': 'ruby',
      '.php': 'php',
      '.cs': 'csharp',
      '.rs': 'rust',
      '.swift': 'swift',
      '.kt': 'kotlin'
    }

    return languageMap[ext] || 'unknown'
  },

  /**
   * Count lines of code (excluding comments and blanks)
   * @param {String} code - Code content
   * @returns {Object} LOC statistics
   */
  countLines: (code) => {
    const lines = code.split('\n')
    let blank = 0
    let comment = 0
    let code_lines = 0

    lines.forEach(line => {
      const trimmed = line.trim()

      if (!trimmed) {
        blank++
      } else if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) {
        comment++
      } else {
        code_lines++
      }
    })

    return {
      total: lines.length,
      code: code_lines,
      comment,
      blank
    }
  }
}

module.exports = codeParserService
