# Contributing to AIFEED

We welcome contributions to the AIFEED platform! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/theFEED.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit your changes: `git commit -m "Add your feature"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a Pull Request

## Development Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/theFEED.git
cd theFEED

# Install dependencies
npm install

# Run in development mode
npm run dev
```

## Code Style

- We use TypeScript for type safety
- Follow the existing code style in the project
- Use ESLint and Prettier for code formatting
- Run `npm run lint` before committing

## Testing

- Write tests for new features
- Run tests with `npm test`
- Ensure all tests pass before submitting PR

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the CHANGELOG.md with your changes
3. Ensure your PR description clearly describes the problem and solution
4. Link any relevant issues in your PR description

## Building

To build the application for all platforms:
```bash
./scripts/compile-build-dist.sh
```

For specific platforms:
```bash
./scripts/compile-build-dist.sh --platform mac
./scripts/compile-build-dist.sh --platform win
./scripts/compile-build-dist.sh --platform linux
```

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the issue, not the person
- Help maintain a positive environment

## Questions?

Feel free to open an issue for any questions or concerns.