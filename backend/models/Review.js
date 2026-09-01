const mongoose = require('mongoose');
const { REVIEW_STATUS, ISSUE_SEVERITY } = require('../config/constants');

const issueSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['bug', 'security', 'performance', 'code_quality', 'refactoring', 'testing', 'documentation'],
      required: true
    },
    severity: {
      type: String,
      enum: Object.values(ISSUE_SEVERITY),
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    file: {
      type: String,
      required: true
    },
    lineNumber: {
      type: Number
    },
    suggestion: {
      type: String
    },
    codeSnippet: {
      type: String
    }
  }
);

const reviewSchema = new mongoose.Schema(
  {
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(REVIEW_STATUS),
      default: REVIEW_STATUS.PENDING
    },
    issues: [issueSchema],
    codeQualityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    summary: {
      type: String
    },
    filesAnalyzed: {
      type: Number,
      default: 0
    },
    totalIssues: {
      type: Number,
      default: 0
    },
    pullRequestUrl: {
      type: String
    },
    branchName: {
      type: String
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
