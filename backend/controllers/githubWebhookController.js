/**
 * GitHub Webhook Controller
 * Handles GitHub webhook events
 */

const githubService = require('../services/githubService')
const codeReviewService = require('../services/codeReviewService')
const Repository = require('../models/Repository')
const User = require('../models/User')

const githubWebhookController = {
  /**
   * Handle GitHub webhook events
   * POST /api/github/webhook
   */
  handleWebhook: async (req, res, next) => {
    try {
      // Verify webhook signature
      const signature = req.headers['x-hub-signature-256']
      const payload = req.rawBody // Need rawBody middleware

      if (!signature || !githubService.verifyWebhookSignature(payload, signature)) {
        return res.status(401).json({ error: 'Invalid webhook signature' })
      }

      const event = req.headers['x-github-event']

      switch (event) {
        case 'pull_request':
          await githubWebhookController.handlePullRequest(req.body, res)
          break
        case 'pull_request_review':
          await githubWebhookController.handlePullRequestReview(req.body, res)
          break
        case 'push':
          await githubWebhookController.handlePush(req.body, res)
          break
        default:
          res.json({ message: 'Event not handled' })
      }
    } catch (error) {
      console.error('Webhook error:', error.message)
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  /**
   * Handle pull request events
   */
  handlePullRequest: async (payload, res) => {
    try {
      const { action, pull_request, repository } = payload

      if (action !== 'opened' && action !== 'synchronize') {
        return res.json({ message: 'PR event not processed' })
      }

      const { owner, name } = repository
      const { number, head, base } = pull_request

      // Find repository in database
      const repo = await Repository.findOne({
        githubFullName: `${owner.login}/${name}`
      })

      if (!repo) {
        return res.json({ message: 'Repository not found in database' })
      }

      // Get user with GitHub token
      const user = await User.findById(repo.userId)

      if (!user || !user.githubToken) {
        return res.json({ message: 'User not linked' })
      }

      // Get PR files
      const files = await githubService.getPRFiles(
        user.githubToken,
        owner.login,
        name,
        number
      )

      let reviewComment = '## 🤖 AI Code Review\n\n'

      // Analyze each changed file
      const issues = []
      for (const file of files) {
        if (file.status === 'removed') continue

        // Extract code from patch
        const patch = file.patch || ''
        const lines = patch.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++'))
        const changedCode = lines.map(l => l.substring(1)).join('\n')

        if (changedCode.trim()) {
          try {
            const analysis = await codeReviewService.analyzeCode(changedCode, 'javascript')
            issues.push({
              file: file.filename,
              analysis
            })
          } catch (error) {
            console.error(`Error analyzing ${file.filename}:`, error.message)
          }
        }
      }

      // Format comment
      if (issues.length > 0) {
        reviewComment += `Found **${issues.length}** issue(s) in this PR:\n\n`

        issues.forEach(({ file, analysis }) => {
          reviewComment += `### ${file}\n`
          if (analysis.issues && analysis.issues.length > 0) {
            reviewComment += analysis.issues.slice(0, 3).map(issue => {
              return `- **${issue.type}** (${issue.severity}): ${issue.title}\n  ${issue.suggestion}`
            }).join('\n')
          }
          reviewComment += '\n'
        })

        reviewComment += '\n---\n*AI-powered code review by AI Developer Review*'
      } else {
        reviewComment += '✅ No issues detected in this pull request!'
      }

      // Post comment
      await githubService.createPRComment(
        user.githubToken,
        owner.login,
        name,
        number,
        reviewComment
      )

      res.json({ message: 'PR reviewed successfully' })
    } catch (error) {
      console.error('Error handling PR:', error.message)
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  /**
   * Handle pull request review events
   */
  handlePullRequestReview: async (payload, res) => {
    try {
      // Could implement additional logic for reviews
      res.json({ message: 'Review event received' })
    } catch (error) {
      console.error('Error handling PR review:', error.message)
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  /**
   * Handle push events
   */
  handlePush: async (payload, res) => {
    try {
      const { repository } = payload
      
      // Could implement auto-sync on push
      res.json({ message: 'Push event received' })
    } catch (error) {
      console.error('Error handling push:', error.message)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

module.exports = githubWebhookController
