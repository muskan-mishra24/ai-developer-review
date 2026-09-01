const Repository = require('../models/Repository');
const { ERROR_MESSAGES } = require('../config/constants');

const repositoryController = {
  create: async (req, res, next) => {
    try {
      const { name, url, description, language } = req.body;

      if (!name || !url) {
        return res.status(400).json({ error: 'Name and URL are required' });
      }

      const repository = new Repository({
        userId: req.user.userId,
        name,
        url,
        description,
        language
      });

      await repository.save();

      res.status(201).json({
        message: 'Repository created successfully',
        repository
      });
    } catch (error) {
      next(error);
    }
  },

  getAll: async (req, res, next) => {
    try {
      const repositories = await Repository.find({ userId: req.user.userId });
      res.json({ repositories });
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const repository = await Repository.findById(req.params.id);

      if (!repository) {
        return res.status(404).json({ error: ERROR_MESSAGES.REPOSITORY_NOT_FOUND });
      }

      if (repository.userId.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      res.json({ repository });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const repository = await Repository.findById(req.params.id);

      if (!repository) {
        return res.status(404).json({ error: ERROR_MESSAGES.REPOSITORY_NOT_FOUND });
      }

      if (repository.userId.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      Object.assign(repository, req.body);
      await repository.save();

      res.json({
        message: 'Repository updated successfully',
        repository
      });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const repository = await Repository.findById(req.params.id);

      if (!repository) {
        return res.status(404).json({ error: ERROR_MESSAGES.REPOSITORY_NOT_FOUND });
      }

      if (repository.userId.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await Repository.deleteOne({ _id: req.params.id });

      res.json({ message: 'Repository deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = repositoryController;
