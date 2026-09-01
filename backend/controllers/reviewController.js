const Review = require('../models/Review');
const Repository = require('../models/Repository');
const { ERROR_MESSAGES, REVIEW_STATUS } = require('../config/constants');

const reviewController = {
  createReview: async (req, res, next) => {
    try {
      const { repositoryId, pullRequestUrl, branchName } = req.body;

      if (!repositoryId) {
        return res.status(400).json({ error: 'Repository ID is required' });
      }

      const repository = await Repository.findById(repositoryId);
      if (!repository) {
        return res.status(404).json({ error: ERROR_MESSAGES.REPOSITORY_NOT_FOUND });
      }

      if (repository.userId.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const review = new Review({
        repositoryId,
        userId: req.user.userId,
        status: REVIEW_STATUS.PENDING,
        pullRequestUrl,
        branchName
      });

      await review.save();

      res.status(201).json({
        message: 'Review created successfully',
        review
      });
    } catch (error) {
      next(error);
    }
  },

  getReviews: async (req, res, next) => {
    try {
      const reviews = await Review.find({ userId: req.user.userId })
        .populate('repositoryId', 'name url')
        .sort({ createdAt: -1 });

      res.json({ reviews });
    } catch (error) {
      next(error);
    }
  },

  getReviewById: async (req, res, next) => {
    try {
      const review = await Review.findById(req.params.id)
        .populate('repositoryId', 'name url')
        .populate('userId', 'username email');

      if (!review) {
        return res.status(404).json({ error: ERROR_MESSAGES.REVIEW_NOT_FOUND });
      }

      if (review.userId._id.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      res.json({ review });
    } catch (error) {
      next(error);
    }
  },

  updateReview: async (req, res, next) => {
    try {
      const review = await Review.findById(req.params.id);

      if (!review) {
        return res.status(404).json({ error: ERROR_MESSAGES.REVIEW_NOT_FOUND });
      }

      if (review.userId.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      Object.assign(review, req.body);
      await review.save();

      res.json({
        message: 'Review updated successfully',
        review
      });
    } catch (error) {
      next(error);
    }
  },

  deleteReview: async (req, res, next) => {
    try {
      const review = await Review.findById(req.params.id);

      if (!review) {
        return res.status(404).json({ error: ERROR_MESSAGES.REVIEW_NOT_FOUND });
      }

      if (review.userId.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await Review.deleteOne({ _id: req.params.id });

      res.json({ message: 'Review deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = reviewController;
