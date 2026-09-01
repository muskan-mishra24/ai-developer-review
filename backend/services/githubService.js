/**
 * GitHub Service
 * Handles all GitHub API interactions and OAuth flow
 */

const { Octokit } = require('octokit')
const axios = require('axios')
const crypto = require('crypto')

class GitHubService {
  constructor() {
    this.clientId = process.env.GITHUB_CLIENT_ID
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET
    this.redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/github/callback'
    this.webhookSecret = process.env.GITHUB_WEBHOOK_SECRET
  }

  /**
   * Generate GitHub OAuth authorization URL
   * @returns {String} Authorization URL
   */
  getAuthorizationUrl() {
    const state = crypto.randomBytes(16).toString('hex')
    
    const url = `https://github.com/login/oauth/authorize?` +
      `client_id=${this.clientId}&` +
      `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
      `scope=repo,read:user,user:email&` +
      `state=${state}`
    
    return { url, state }
  }

  /**
   * Exchange authorization code for access token
   * @param {String} code - Authorization code
   * @returns {Promise<Object>} Access token and user info
   */
  async getAccessToken(code) {
    try {
      const response = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: this.redirectUri
        },
        {
          headers: {
            Accept: 'application/json'
          }
        }
      )

      if (response.data.error) {
        throw new Error(`GitHub OAuth error: ${response.data.error_description}`)
      }

      return response.data
    } catch (error) {
      console.error('Error getting GitHub access token:', error.message)
      throw error
    }
  }

  /**
   * Get GitHub user info
   * @param {String} accessToken - GitHub access token
   * @returns {Promise<Object>} User information
   */
  async getUserInfo(accessToken) {
    try {
      const octokit = new Octokit({
        auth: accessToken
      })

      const user = await octokit.request('GET /user')
      const emails = await octokit.request('GET /user/emails')

      const primaryEmail = emails.data.find(e => e.primary)?.email || user.data.email

      return {
        id: user.data.id,
        login: user.data.login,
        name: user.data.name,
        email: primaryEmail,
        avatar: user.data.avatar_url,
        bio: user.data.bio,
        company: user.data.company,
        location: user.data.location
      }
    } catch (error) {
      console.error('Error getting user info:', error.message)
      throw error
    }
  }

  /**
   * Get user's repositories
   * @param {String} accessToken - GitHub access token
   * @returns {Promise<Array>} User repositories
   */
  async getUserRepositories(accessToken) {
    try {
      const octokit = new Octokit({
        auth: accessToken
      })

      const repos = await octokit.paginate('GET /user/repos', {
        sort: 'updated',
        per_page: 100
      })

      return repos.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        cloneUrl: repo.clone_url,
        language: repo.language,
        stars: repo.stargazers_count,
        watchers: repo.watchers_count,
        forks: repo.forks_count,
        isPrivate: repo.private,
        owner: {
          login: repo.owner.login,
          avatar: repo.owner.avatar_url
        }
      }))
    } catch (error) {
      console.error('Error getting user repositories:', error.message)
      throw error
    }
  }

  /**
   * Get repository details
   * @param {String} accessToken - GitHub access token
   * @param {String} owner - Repository owner
   * @param {String} repo - Repository name
   * @returns {Promise<Object>} Repository details
   */
  async getRepository(accessToken, owner, repo) {
    try {
      const octokit = new Octokit({
        auth: accessToken
      })

      const repoData = await octokit.request('GET /repos/{owner}/{repo}', {
        owner,
        repo
      })

      return {
        id: repoData.data.id,
        name: repoData.data.name,
        fullName: repoData.data.full_name,
        description: repoData.data.description,
        url: repoData.data.html_url,
        language: repoData.data.language,
        stars: repoData.data.stargazers_count,
        isPrivate: repoData.data.private
      }
    } catch (error) {
      console.error('Error getting repository:', error.message)
      throw error
    }
  }

  /**
   * Get repository files
   * @param {String} accessToken - GitHub access token
   * @param {String} owner - Repository owner
   * @param {String} repo - Repository name
   * @param {String} path - File path
   * @returns {Promise<Array>} Files in directory
   */
  async getRepositoryFiles(accessToken, owner, repo, path = '') {
    try {
      const octokit = new Octokit({
        auth: accessToken
      })

      const contents = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        path: path || ''
      })

      if (!Array.isArray(contents.data)) {
        return [contents.data]
      }

      return contents.data
    } catch (error) {
      console.error('Error getting repository files:', error.message)
      throw error
    }
  }

  /**
   * Get file content
   * @param {String} accessToken - GitHub access token
   * @param {String} owner - Repository owner
   * @param {String} repo - Repository name
   * @param {String} path - File path
   * @returns {Promise<String>} File content
   */
  async getFileContent(accessToken, owner, repo, path) {
    try {
      const octokit = new Octokit({
        auth: accessToken
      })

      const file = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        path
      })

      if (file.data.type !== 'file') {
        throw new Error('Path is not a file')
      }

      const content = Buffer.from(file.data.content, 'base64').toString('utf-8')
      return content
    } catch (error) {
      console.error('Error getting file content:', error.message)
      throw error
    }
  }

  /**
   * Create pull request comment
   * @param {String} accessToken - GitHub access token
   * @param {String} owner - Repository owner
   * @param {String} repo - Repository name
   * @param {Number} prNumber - Pull request number
   * @param {String} body - Comment body
   * @returns {Promise<Object>} Created comment
   */
  async createPRComment(accessToken, owner, repo, prNumber, body) {
    try {
      const octokit = new Octokit({
        auth: accessToken
      })

      const comment = await octokit.request(
        'POST /repos/{owner}/{repo}/issues/{issue_number}/comments',
        {
          owner,
          repo,
          issue_number: prNumber,
          body
        }
      )

      return comment.data
    } catch (error) {
      console.error('Error creating PR comment:', error.message)
      throw error
    }
  }

  /**
   * Create PR review comment
   * @param {String} accessToken - GitHub access token
   * @param {String} owner - Repository owner
   * @param {String} repo - Repository name
   * @param {Number} prNumber - Pull request number
   * @param {String} commitId - Commit SHA
   * @param {String} path - File path
   * @param {Number} line - Line number
   * @param {String} body - Comment body
   * @returns {Promise<Object>} Created review comment
   */
  async createPRReviewComment(accessToken, owner, repo, prNumber, commitId, path, line, body) {
    try {
      const octokit = new Octokit({
        auth: accessToken
      })

      const comment = await octokit.request(
        'POST /repos/{owner}/{repo}/pulls/{pull_number}/comments',
        {
          owner,
          repo,
          pull_number: prNumber,
          commit_id: commitId,
          path,
          line,
          body
        }
      )

      return comment.data
    } catch (error) {
      console.error('Error creating PR review comment:', error.message)
      throw error
    }
  }

  /**
   * Get pull request details
   * @param {String} accessToken - GitHub access token
   * @param {String} owner - Repository owner
   * @param {String} repo - Repository name
   * @param {Number} prNumber - Pull request number
   * @returns {Promise<Object>} PR details
   */
  async getPullRequest(accessToken, owner, repo, prNumber) {
    try {
      const octokit = new Octokit({
        auth: accessToken
      })

      const pr = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
        owner,
        repo,
        pull_number: prNumber
      })

      return {
        number: pr.data.number,
        title: pr.data.title,
        body: pr.data.body,
        state: pr.data.state,
        author: pr.data.user.login,
        createdAt: pr.data.created_at,
        updatedAt: pr.data.updated_at,
        head: {
          ref: pr.data.head.ref,
          sha: pr.data.head.sha
        },
        base: {
          ref: pr.data.base.ref,
          sha: pr.data.base.sha
        }
      }
    } catch (error) {
      console.error('Error getting pull request:', error.message)
      throw error
    }
  }

  /**
   * Get changed files in PR
   * @param {String} accessToken - GitHub access token
   * @param {String} owner - Repository owner
   * @param {String} repo - Repository name
   * @param {Number} prNumber - Pull request number
   * @returns {Promise<Array>} Changed files
   */
  async getPRFiles(accessToken, owner, repo, prNumber) {
    try {
      const octokit = new Octokit({
        auth: accessToken
      })

      const files = await octokit.paginate('GET /repos/{owner}/{repo}/pulls/{pull_number}/files', {
        owner,
        repo,
        pull_number: prNumber,
        per_page: 100
      })

      return files.map(file => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch
      }))
    } catch (error) {
      console.error('Error getting PR files:', error.message)
      throw error
    }
  }

  /**
   * Verify webhook signature
   * @param {String} payload - Request payload
   * @param {String} signature - X-Hub-Signature-256 header
   * @returns {Boolean} Signature valid
   */
  verifyWebhookSignature(payload, signature) {
    const hash = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex')
    
    const expected = `sha256=${hash}`
    return crypto.timingSafeEqual(expected, signature)
  }

  /**
   * Create webhook
   * @param {String} accessToken - GitHub access token
   * @param {String} owner - Repository owner
   * @param {String} repo - Repository name
   * @param {String} webhookUrl - Webhook URL
   * @returns {Promise<Object>} Created webhook
   */
  async createWebhook(accessToken, owner, repo, webhookUrl) {
    try {
      const octokit = new Octokit({
        auth: accessToken
      })

      const webhook = await octokit.request(
        'POST /repos/{owner}/{repo}/hooks',
        {
          owner,
          repo,
          name: 'web',
          active: true,
          events: ['pull_request', 'push', 'pull_request_review'],
          config: {
            url: webhookUrl,
            content_type: 'json',
            secret: this.webhookSecret
          }
        }
      )

      return webhook.data
    } catch (error) {
      console.error('Error creating webhook:', error.message)
      throw error
    }
  }

  /**
   * Get pull request diff
   * @param {String} accessToken - GitHub access token
   * @param {String} owner - Repository owner
   * @param {String} repo - Repository name
   * @param {Number} prNumber - Pull request number
   * @returns {Promise<String>} Diff content
   */
  async getPRDiff(accessToken, owner, repo, prNumber) {
    try {
      const octokit = new Octokit({
        auth: accessToken
      })

      const diff = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
        owner,
        repo,
        pull_number: prNumber,
        headers: {
          Accept: 'application/vnd.github.v3.diff'
        }
      })

      return diff.data
    } catch (error) {
      console.error('Error getting PR diff:', error.message)
      throw error
    }
  }
}

module.exports = new GitHubService()
