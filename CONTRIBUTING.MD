# Contributing to @ng-nomads/tools

Thank you for considering contributing to @ng-nomads/tools! This document outlines the process for contributing to this project.

## Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Set up the development environment
4. Create a branch for your contribution

```bash
git clone https://github.com/YOUR-USERNAME/tools.git
cd tools
npm install
npm run build
```

## Development Workflow

This project uses a monorepo structure with npm workspaces. Each package is in the `packages/` directory.

### Creating a New Feature or Fixing a Bug

1. Create a new branch with a descriptive name:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/issue-you-are-fixing
   ```

2. Make your changes

3. Build and test your changes:
   ```bash
   npm run build
   # Add appropriate tests and run them
   ```

4. Commit your changes with a descriptive message following [conventional commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add new capability to create-ng-component"
   # or
   git commit -m "fix: resolve issue with library generation"
   ```

5. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Open a Pull Request from your fork to the main repository

## Pull Request Guidelines

- Include a clear description of the changes and their purpose
- Make sure your PR addresses a specific issue or adds a well-defined feature
- Include tests for your changes when applicable
- Make sure all tests pass before submitting
- Update documentation as needed
- Add an entry to the CHANGELOG.md if your change is significant

## Versioning

This project follows [Semantic Versioning](https://semver.org/). The version number is automatically determined based on commit messages and branch names:

- Feature branches trigger minor version bumps
- Bugfix branches trigger patch version bumps
- Breaking changes (indicated by `!` or `BREAKING` in commit/PR titles) trigger major version bumps

## Release Process

Releases are automatically managed through GitHub Actions:

- Pushing to feature or bugfix branches creates RC releases
- Pull requests to main create PR-specific releases for testing
- Merged PRs to main create final releases

## Questions?

If you have any questions or need help, please open an issue in the repository.

Thank you for contributing to @ng-nomads/tools!