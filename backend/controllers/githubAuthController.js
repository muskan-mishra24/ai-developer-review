/**
 * GitHub Auth Controller
 * Handles OAuth flow and GitHub authentication
 */

const githubService = require('../services/githubService')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const githubAuthController = {
  /**
   * Get GitHub authorization URL
   * GET /api/github/auth/url
   */
  getAuthUrl: async (req, res, next) => {
    try {
      const { url, state } = githubService.getAuthorizationUrl()
      
      res.json({
        authUrl: url,
        state
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Handle GitHub OAuth callback
   * POST /api/github/auth/callback
   */
  handleCallback: async (req, res, next) => {
    try {
      const { code } = req.body

      if (!code) {
        return res.status(400).json({ error: 'Authorization code is required' })
      }

      // Get access token
      const tokenResponse = await githubService.getAccessToken(code)
      const accessToken = tokenResponse.access_token

      if (!accessToken) {
        return res.status(400).json({ error: 'Failed to get access token' })
      }

      // Get user info
      const githubUser = await githubService.getUserInfo(accessToken)

      // Find or create user
      let user = await User.findOne({ githubId: githubUser.id })

      if (!user) {
        user = new User({
          username: githubUser.login,
          email: githubUser.email,
          githubId: githubUser.id,
          githubToken: accessToken,
          avatar: githubUser.avatar,
          name: githubUser.name
        })
        await user.save()
      } else {
        // Update GitHub token
        user.githubToken = accessToken
        user.avatar = githubUser.avatar
        await user.save()
      }

      // Generate JWT token
      const jwtToken = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      )

      res.json({
        token: jwtToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          name: user.name
        }
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Get GitHub user repositories
   * GET /api/github/repos
   */
  getUserRepositories: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.userId)

      if (!user || !user.githubToken) {
        return res.status(401).json({ error: 'GitHub account not linked' })
      }

      const repos = await githubService.getUserRepositories(user.githubToken)

      res.json({
        repositories: repos,
        count: repos.length
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Link GitHub account
   * POST /api/github/link
   */
  linkGitHub: async (req, res, next) => {
    try {
      const { code } = req.body

      if (!code) {
        return res.status(400).json({ error: 'Authorization code is required' })
      }

      // Get access token
      const tokenResponse = await githubService.getAccessToken(code)
      const accessToken = tokenResponse.access_token

      if (!accessToken) {
        return res.status(400).json({ error: 'Failed to get access token' })
      }

      // Get user info
      const githubUser = await githubService.getUserInfo(accessToken)

      // Update current user
      const user = await User.findById(req.user.userId)
      user.githubId = githubUser.id
      user.githubToken = accessToken
      user.avatar = githubUser.avatar
      if (!user.name) user.name = githubUser.name
      await user.save()

      res.json({
        message: 'GitHub account linked successfully',
        user: {
          id: user._id,
          username: user.username,
          githubId: user.githubId,
          avatar: user.avatar
        }
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Unlink GitHub account
   * POST /api/github/unlink
   */
  unlinkGitHub: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.userId)
      
      user.githubId = null
      user.githubToken = null
      await user.save()

      res.json({
        message: 'GitHub account unlinked successfully'
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = githubAuthController
