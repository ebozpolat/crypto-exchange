# Contributing to Xosmox

Thank you for your interest in contributing to Xosmox! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
- Use the GitHub issue tracker
- Provide detailed information about the bug or feature request
- Include steps to reproduce for bugs
- Use appropriate labels

### Pull Requests
1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Add tests if applicable
5. Ensure all tests pass
6. Update documentation
7. Submit a pull request

## 🏗️ Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/xosmox.git
   cd xosmox
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd xosmox-backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Start development environment**
   ```bash
   ./start-xosmox.sh
   ```

## 📝 Coding Standards

### JavaScript/TypeScript
- Use TypeScript for new code
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful variable and function names
- Add JSDoc comments for functions

### React Components
- Use functional components with hooks
- Follow React best practices
- Use TypeScript interfaces for props
- Keep components small and focused

### Backend Code
- Use async/await for asynchronous operations
- Implement proper error handling
- Add input validation
- Write unit tests for new features

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd xosmox-backend
npm test

# Frontend tests
cd frontend
npm test
```

### Writing Tests
- Write unit tests for new functions
- Add integration tests for API endpoints
- Test React components with React Testing Library
- Maintain test coverage above 80%

## 📚 Documentation

- Update README.md for new features
- Add JSDoc comments to functions
- Update API documentation
- Include examples in documentation

## 🔄 Git Workflow

### Branch Naming
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `docs/description` - Documentation updates

### Commit Messages
Follow conventional commits format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(trading): add limit order functionality
fix(auth): resolve JWT token expiration issue
docs(api): update authentication endpoints
```

## 🚀 Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create release branch
4. Test thoroughly
5. Create pull request to main
6. Tag release after merge

## 🔒 Security

- Report security vulnerabilities privately
- Don't commit sensitive information
- Use environment variables for secrets
- Follow security best practices

## 📋 Code Review

### For Reviewers
- Check code quality and standards
- Verify tests pass
- Review security implications
- Provide constructive feedback

### For Contributors
- Respond to feedback promptly
- Make requested changes
- Keep pull requests focused
- Update based on review comments

## 🎯 Areas for Contribution

### High Priority
- Bug fixes
- Performance improvements
- Security enhancements
- Test coverage improvements

### Medium Priority
- New trading features
- UI/UX improvements
- Documentation updates
- Code refactoring

### Low Priority
- New integrations
- Advanced features
- Experimental features

## 📞 Getting Help

- GitHub Discussions for questions
- GitHub Issues for bugs
- Discord community (if available)
- Email maintainers for sensitive issues

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Invited to maintainer team (for significant contributions)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Xosmox! 🚀