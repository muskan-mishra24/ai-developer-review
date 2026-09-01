const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      trim: true
    },
    githubId: {
      type: String,
      unique: true,
      sparse: true
    },
    githubFullName: {
      type: String,
      unique: true,
      sparse: true
    },
    githubOwner: {
      type: String
    },
    githubRepo: {
      type: String
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    language: {
      type: String
    },
    stars: {
      type: Number,
      default: 0
    },
    filesCount: {
      type: Number,
      default: 0
    },
    lastAnalyzedAt: {
      type: Date
    },
    lastSyncedAt: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    codeQualityScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Repository', repositorySchema);
