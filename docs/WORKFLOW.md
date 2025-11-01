# AIFEED Development Workflow

## Overview

This document outlines the standard development workflow for AIFEED project, including setup, coding practices, testing, and deployment processes.

## Development Environment Setup

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **Git** for version control
- **Electron** for desktop app development
- **TypeScript** for type safety

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/sanchez314c/ai-feed.git
cd ai-feed

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your API keys to .env file
# ANTHROPIC_API_KEY=your_claude_api_key
# NEWS_API_KEY=your_news_api_key (optional)
# YOUTUBE_API_KEY=your_youtube_api_key (optional)
```

### Development Tools Configuration

#### VS Code Extensions (Recommended)

- TypeScript and JavaScript Language Features
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens
- Thunder Client (for API testing)

#### Environment Variables

Create `.env` file with:

```env
# API Keys
ANTHROPIC_API_KEY=your_claude_api_key
NEWS_API_KEY=your_news_api_key
YOUTUBE_API_KEY=your_youtube_api_key

# Development
NODE_ENV=development
LOG_LEVEL=debug

# Database (if using local)
DATABASE_URL=postgresql://user:password@localhost:5432/aifeed
REDIS_URL=redis://localhost:6379

# Search
ELASTICSEARCH_URL=http://localhost:9200
```

## Daily Development Workflow

### 1. Start Your Day

```bash
# Pull latest changes
git pull origin main

# Create/switch to your feature branch
git checkout -b feature/your-feature-name

# Install any new dependencies
npm install

# Start development servers
npm run dev
```

### 2. Development Process

#### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Individual feature branches
- `hotfix/*` - Critical fixes to production

#### Commit Guidelines

Follow conventional commits:

```bash
# Feature
git commit -m "feat: add user authentication system"

# Bug fix
git commit -m "fix: resolve memory leak in data collector"

# Documentation
git commit -m "docs: update API documentation"

# Style
git commit -m "style: fix linting errors in components"
```

#### Code Review Process

1. Create pull request to `develop`
2. Ensure CI/CD checks pass
3. Request review from team members
4. Address feedback
5. Merge after approval

### 3. Running the Application

```bash
# Start development servers (Vite + Electron)
npm run dev

# Or start components individually:
npm run dev:renderer  # Start Vite dev server
npm run dev:main      # Start Electron main process
```

### 4. Making Changes

#### Adding New Features

1. Create feature branch
2. Implement feature with tests
3. Update documentation
4. Run tests and linting
5. Commit changes
6. Create pull request

#### Fixing Bugs

1. Create hotfix branch from `main`
2. Fix bug with regression test
3. Test thoroughly
4. Commit and push
5. Create pull request to `main`

## Testing Workflow

### Local Testing

```bash
# Run all tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Test Structure

```
src/
├── components/
│   └── __tests__/
│       ├── ComponentName.test.tsx
│       └── __snapshots__/
├── services/
│   └── __tests__/
│       └── ServiceName.test.ts
└── utils/
    └── __tests__/
        └── utilName.test.ts
```

### Testing Best Practices

1. **Unit Tests**
   - Test individual functions/components
   - Mock external dependencies
   - Aim for 95%+ coverage

2. **Integration Tests**
   - Test service interactions
   - Use test database
   - Verify API contracts

3. **E2E Tests**
   - Test user workflows
   - Use Playwright or Cypress
   - Cover critical paths

## Code Quality Workflow

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Type checking
npm run type-check

# Format code with Prettier
npm run format

# Run all quality checks
npm run quality-check
```

### Pre-commit Hooks

Using Husky for pre-commit checks:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write", "git add"]
  }
}
```

## Build and Deployment Workflow

### Building the Application

```bash
# Build for current platform
npm run build

# Build distribution packages
npm run dist:current    # Current platform only
npm run dist:mac        # macOS only
npm run dist:win        # Windows only
npm run dist:linux      # Linux only
npm run dist            # All platforms
npm run dist:maximum    # All platforms + all architectures
```

### Build Process

1. **Clean Build**

   ```bash
   npm run clean
   ```

2. **Type Check**

   ```bash
   npm run type-check
   ```

3. **Lint Check**

   ```bash
   npm run lint
   ```

4. **Run Tests**

   ```bash
   npm test
   ```

5. **Build Application**

   ```bash
   npm run build
   ```

6. **Package for Distribution**
   ```bash
   npm run dist
   ```

### Deployment Pipeline

#### GitHub Actions Workflow

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  build:
    needs: test
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run dist
      - uses: actions/upload-artifact@v3
        with:
          name: dist-${{ matrix.os }}
          path: dist/
```

## Release Workflow

### Version Management

Using semantic versioning:

- **Major** (X.0.0) - Breaking changes
- **Minor** (0.X.0) - New features
- **Patch** (0.0.X) - Bug fixes

### Release Process

1. **Prepare Release**

   ```bash
   # Update version in package.json
   npm version patch  # or minor/major

   # Update CHANGELOG.md
   git add CHANGELOG.md
   git commit -m "docs: update changelog for v${version}"
   ```

2. **Create Release Tag**

   ```bash
   git tag v${version}
   git push origin v${version}
   ```

3. **Build and Upload**
   - GitHub Actions automatically builds
   - Creates GitHub Release
   - Uploads artifacts

### Release Channels

- **Stable** - Released to main branch
- **Beta** - Released to develop branch
- **Alpha** - Feature branches for testing

## Documentation Workflow

### Documentation Types

1. **API Documentation**
   - Auto-generated from TypeScript
   - Located in `/docs/API.md`
   - Updated with each release

2. **User Documentation**
   - User guides and tutorials
   - Located in `/docs/USER_GUIDE.md`
   - Reviewed by UX team

3. **Developer Documentation**
   - Architecture and setup guides
   - Located in `/docs/DEVELOPMENT.md`
   - Maintained by development team

### Documentation Updates

1. **Code Changes**
   - Update JSDoc comments
   - Add inline documentation
   - Document new APIs

2. **Feature Documentation**
   - Update user guides
   - Add screenshots
   - Create tutorials

3. **Review Process**
   - Technical review by developers
   - UX review by designers
   - Final approval by tech lead

## Troubleshooting Workflow

### Common Issues

1. **Build Failures**

   ```bash
   # Clear all caches
   npm run clean:full

   # Delete node_modules
   rm -rf node_modules
   npm install
   ```

2. **Test Failures**

   ```bash
   # Run tests in debug mode
   npm run test:debug

   # Update snapshots
   npm run test:update-snapshots
   ```

3. **Electron Issues**

   ```bash
   # Rebuild native modules
   npm run rebuild

   # Clear Electron cache
   rm -rf ~/Library/Application\ Support/Electron
   ```

### Getting Help

1. **Check Documentation**
   - Read relevant docs in `/docs/`
   - Search existing issues

2. **Ask the Team**
   - Slack channel: `#aifeed-dev`
   - Create discussion in GitHub

3. **Create Issue**
   - Use bug report template
   - Include reproduction steps
   - Add environment details

## Performance Monitoring

### Development Metrics

1. **Bundle Size**

   ```bash
   npm run analyze
   ```

2. **Performance Tests**

   ```bash
   npm run test:performance
   ```

3. **Lighthouse CI**
   - Automated with each PR
   - Minimum score: 90

### Production Monitoring

1. **Error Tracking**
   - Sentry integration
   - Real-time alerts

2. **Performance Monitoring**
   - Web Vitals
   - APM tools

3. **Usage Analytics**
   - Feature usage tracking
   - User behavior analysis

## Security Workflow

### Security Checks

1. **Dependency Scanning**

   ```bash
   npm audit
   npm audit fix
   ```

2. **Secret Scanning**
   - Git hooks prevent commits
   - GitHub Actions scanning

3. **Code Review**
   - Security-focused review
   - OWASP checklist

### Security Best Practices

1. **API Keys**
   - Never commit to repo
   - Use environment variables
   - Rotate regularly

2. **User Data**
   - Encrypt at rest
   - Use HTTPS in transit
   - Follow GDPR

3. **Code Security**
   - Input validation
   - Output encoding
   - Principle of least privilege

## Collaboration Workflow

### Team Communication

1. **Daily Standups**
   - Time: 9:00 AM PST
   - Duration: 15 minutes
   - Topics: Yesterday, Today, Blockers

2. **Sprint Planning**
   - Bi-weekly sprints
   - Sprint goals and stories
   - Capacity planning

3. **Retrospectives**
   - End of each sprint
   - What went well
   - What can be improved

### Code Review Guidelines

1. **Review Checklist**
   - [ ] Code follows style guide
   - [ ] Tests are included
   - [ ] Documentation updated
   - [ ] No hardcoded secrets
   - [ ] Performance considered
   - [ ] Security reviewed

2. **Review Etiquette**
   - Be constructive
   - Explain reasoning
   - Suggest improvements
   - Thank contributors

## Continuous Improvement

### Learning and Development

1. **Tech Talks**
   - Monthly presentations
   - Share knowledge
   - Learn new technologies

2. **Code Reviews**
   - Pair programming
   - Mob programming
   - Knowledge sharing

3. **Experimentation**
   - Hack days
   - Prototype features
   - Test new tools

### Process Improvement

1. **Metrics Tracking**
   - Lead time
   - Cycle time
   - Deploy frequency

2. **Feedback Loop**
   - Team surveys
   - Process reviews
   - Kaizen events

3. **Tool Updates**
   - Evaluate new tools
   - Update dependencies
   - Improve workflows
