/**
 * GitHub Sync Controller
 * Handles syncing repositories from GitHub
 */

const githubService = require('../services/githubService')
const codeParserService = require('../services/codeParserService')
const ragService = require('../services/ragService')
const User = require('../models/User')
const Repository = require('../models/Repository')

const githubSyncController = {
  /**
   * Import repository from GitHub
   * POST /api/github/import
   */
  importRepository: async (req, res, next) => {
    try {
      const { owner, repo } = req.body

      if (!owner || !repo) {
        return res.status(400).json({ error: 'Owner and repository name are required' })
      }

      const user = await User.findById(req.user.userId)

      if (!user || !user.githubToken) {
        return res.status(401).json({ error: 'GitHub account not linked' })
      }

      // Get repository details from GitHub
      const repoData = await githubService.getRepository(user.githubToken, owner, repo)

      // Check if already imported
      let importedRepo = await Repository.findOne({
        userId: req.user.userId,
        githubFullName: `${owner}/${repo}`
      })

      if (!importedRepo) {
        importedRepo = new Repository({
          userId: req.user.userId,
          name: repoData.name,
          description: repoData.description,
          url: repoData.url,
          language: repoData.language,
          githubFullName: `${owner}/${repo}`,
          githubOwner: owner,
          githubRepo: repo,
          stars: repoData.stars,
          isPrivate: repoData.isPrivate
        })
        await importedRepo.save()
      }

      res.json({
        message: 'Repository imported successfully',
        repository: {
          id: importedRepo._id,
          name: importedRepo.name,
          description: importedRepo.description,
          url: importedRepo.url,
          language: importedRepo.language
        }
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Sync repository code from GitHub
   * POST /api/github/sync/:repositoryId
   */
  syncRepository: async (req, res, next) => {
    try {
      const { repositoryId } = req.params

      const repo = await Repository.findById(repositoryId)

      if (!repo || repo.userId.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' })
      }

      if (!repo.githubFullName) {
        return res.status(400).json({ error: 'Repository is not linked to GitHub' })
      }

      const user = await User.findById(req.user.userId)

      if (!user || !user.githubToken) {
        return res.status(401).json({ error: 'GitHub account not linked' })
      }

      const [owner, repoName] = repo.githubFullName.split('/')

      // Fetch files from GitHub (simplified - in production, would fetch recursively)
      const codeFiles = []

      try {
        // Common file patterns
        const filePatterns = ['src', 'lib', 'app', 'backend']
        
        for (const pattern of filePatterns) {
          try {
            const contents = await githubService.getRepositoryFiles(
              user.githubToken,
              owner,
              repoName,
              pattern
            )

            if (Array.isArray(contents)) {
              for (const item of contents) {
                if (item.type === 'file' && ['.js', '.ts', '.py', '.java'].some(ext => item.name.endsWith(ext))) {
                  try {
                    const content = await githubService.getFileContent(
                      user.githubToken,
                      owner,
                      repoName,
                      item.path
                    )

                    codeFiles.push({
                      file: item.path,
                      code: content,
                      language: codeParserService.getLanguageFromExtension(
                        item.name.substring(item.name.lastIndexOf('.'))
                      )
                    })
                  } catch (e) {
                    // Continue on file read errors
                  }
                }
              }
            }
          } catch (e) {
            // Continue if directory doesn't exist
          }
        }
      } catch (error) {
        console.error('Error fetching files from GitHub:', error.message)
      }

      // Index with RAG
      const indexResults = await ragService.indexRepository(repositoryId.toString(), codeFiles)

      // Update repository
      repo.lastSyncedAt = new Date()
      repo.filesCount = codeFiles.length
      await repo.save()

      res.json({
        message: 'Repository synced successfully',
        sync: {
          filesCount: codeFiles.length,
          indexed: indexResults.indexed,
          failed: indexResults.failed
        }
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Get repository's GitHub metadata
   * GET /api/github/repo/:repositoryId/metadata
   */
  getMetadata: async (req, res, next) => {
    try {
      const { repositoryId } = req.params

      const repo = await Repository.findById(repositoryId)

      if (!repo || repo.userId.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' })
      }

      if (!repo.githubFullName) {
        return res.status(400).json({ error: 'Repository is not linked to GitHub' })
      }

      const user = await User.findById(req.user.userId)

      if (!user || !user.githubToken) {
        return res.status(401).json({ error: 'GitHub account not linked' })
      }

      const [owner, repoName] = repo.githubFullName.split('/')
      const metadata = await githubService.getRepository(user.githubToken, owner, repoName)

      res.json({
        metadata: {
          name: metadata.name,
          description: metadata.description,
          url: metadata.url,
          language: metadata.language,
          stars: metadata.stars,
          isPrivate: metadata.isPrivate
        }
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = githubSyncController
