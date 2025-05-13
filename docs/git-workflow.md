# LearnMeet Git Workflow

This document outlines the Git workflow for the LearnMeet project to ensure coordinated development aligned with our implementation roadmap.

## Branch Structure

### Main Branches
- `master` - Production-ready code
- `develop` - Integration branch for features in active development

### Supporting Branches
- `feature/*` - New features (e.g., `feature/authentication`)
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical fixes for production
- `release/*` - Release preparation

## Development Workflow

### 1. Feature Development

1. **Create a feature branch**
   ```
   git checkout develop
   git checkout -b feature/feature-name
   ```

2. **Work on the feature**
   ```
   git add .
   git commit -m "Descriptive commit message"
   ```

3. **Update with latest changes from develop**
   ```
   git checkout develop
   git pull
   git checkout feature/feature-name
   git rebase develop
   ```

4. **Create a Pull Request**
   - Push the feature branch to remote
   - Create a PR against the `develop` branch
   - Request code review
   - Merge after approval

### 2. Release Process

1. **Create a release branch**
   ```
   git checkout develop
   git checkout -b release/v1.x.0
   ```

2. **Stabilize the release**
   - Only bug fixes are allowed on release branches
   - No new features

3. **Merge to master and develop**
   ```
   git checkout master
   git merge release/v1.x.0
   git tag -a v1.x.0 -m "Version 1.x.0"
   git push origin master --tags
   
   git checkout develop
   git merge release/v1.x.0
   git push origin develop
   ```

### 3. Hotfix Process

1. **Create a hotfix branch from master**
   ```
   git checkout master
   git checkout -b hotfix/issue-description
   ```

2. **Fix the issue**
   ```
   git add .
   git commit -m "Fix critical issue X"
   ```

3. **Merge to master and develop**
   ```
   git checkout master
   git merge hotfix/issue-description
   git tag -a v1.x.1 -m "Version 1.x.1"
   git push origin master --tags
   
   git checkout develop
   git merge hotfix/issue-description
   git push origin develop
   ```

## Phase-Based Development

According to our implementation roadmap:

1. **Phase 1: Foundation (Months 1-3)**
   - Feature branches for authentication, UI components, etc.
   
2. **Phase 2: Educational Enhancements (Months 4-6)**
   - Feature branches for whiteboard, course management, etc.
   
3. **Phase 3: AI Integration (Months 7-10)**
   - Feature branches for Gemini API, AI features, etc.
   
4. **Phase 4: Scale & Optimization (Months 11-12)**
   - Feature branches for performance optimization, etc.

## Commit Guidelines

1. **Commit Message Format**
   ```
   [Component] Brief description of changes
   
   More detailed explanation if necessary
   ```

2. **Components Examples**
   - `[Auth]` - Authentication related
   - `[UI]` - User interface
   - `[WebRTC]` - Video conferencing
   - `[API]` - Backend API
   - `[Docs]` - Documentation
   - `[AI]` - AI integration

3. **Pull Request Format**
   - Title: `[Component] Feature description`
   - Description:
     - What changes were made
     - Why these changes were made
     - Any testing considerations
     - Related issues or tasks

## CI/CD Integration

- **Pre-commit hooks** for linting and formatting
- **CI Pipeline** for automated testing on PRs
- **CD Pipeline** for automated deployment

By following this workflow, we ensure that:
1. Development follows the implementation roadmap
2. Code quality is maintained
3. Release process is systematic
4. Team collaboration is efficient
