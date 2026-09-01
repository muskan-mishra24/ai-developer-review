const express = require('express')
const githubAuthController = require('../controllers/githubAuthController')
const githubSyncController = require('../controllers/githubSyncController')
const githubWebhookController = require('../controllers/githubWebhookController')

const router = express.Router()

// Auth endpoints
router.get('/auth/url', githubAuthController.getAuthUrl)
router.post('/auth/callback', githubAuthController.handleCallback)
router.post('/link', githubAuthController.linkGitHub)
router.post('/unlink', githubAuthController.unlinkGitHub)

// Sync endpoints
router.post('/import', githubSyncController.importRepository)
router.post('/sync/:repositoryId', githubSyncController.syncRepository)
router.get('/repo/:repositoryId/metadata', githubSyncController.getMetadata)

// Webhook endpoint (public)
router.post('/webhook', githubWebhookController.handleWebhook)

// Get user repositories
router.get('/repos', githubAuthController.getUserRepositories)

module.exports = router
