# AI Developer Review

AI-powered code review and developer assistant that analyzes source code
for bugs, security vulnerabilities, performance issues, and code quality
using LLMs and Retrieval-Augmented Generation (RAG).

## Features

- AI-powered code review
- Bug detection
- Security vulnerability detection
- Performance analysis
- Code quality and refactoring suggestions
- AI-generated test cases
- Code quality scoring
- Codebase Q&A using RAG
- AI-generated documentation
- GitHub repository integration
- Automated pull-request reviews

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Monaco Editor

### Backend
- Node.js
- Express.js
- REST APIs
- JWT Authentication

### Database
- PostgreSQL
- pgvector

### AI
- Large Language Models (LLMs)
- Embeddings
- Retrieval-Augmented Generation (RAG)

### Infrastructure
- Docker
- Redis
- BullMQ
- GitHub Actions

## Architecture

```text
                    React Frontend
                          |
                          v
                   Node.js / Express
                          |
              +-----------+-----------+
              |           |           |
              v           v           v
            Auth      Repository    AI Service
                        Service         |
                           |            |
                           v            v
                      Code Parser     RAG
                                        |
                                        v
                                  Vector Database
                                   (PostgreSQL)
                                        |
                                        v
                                       LLM