# @ng-nomads/tools

A suite of CLI tools and utilities for Angular development, designed to streamline and enhance your Angular workflow.

## Packages

This monorepo contains the following packages:

- `@ng-nomads/add-ng-application`: Add a new Angular application to your workspace
- `@ng-nomads/add-ng-library`: Add a new Angular library to your workspace
- `@ng-nomads/create-ng-application`: Create a new Angular application
- `@ng-nomads/create-ng-component`: Create Angular components with best practices
- `@ng-nomads/create-ng-library`: Create a new Angular library
- `@ng-nomads/create-ng-project`: Create a new Angular project workspace

## Installation

You can install any of the packages individually:

```bash
npm install -g @ng-nomads/create-ng-component
```

Or use them directly with npx:

```bash
npx @ng-nomads/create-ng-component --name my-component
```

## Usage

Each package has its own specific usage instructions. Here are some examples:

### @ng-nomads/create-ng-component

Create Angular components with a standardized structure:

```bash
npx @ng-nomads/create-ng-component --name my-component
```

### @ng-nomads/create-ng-application

Create a new Angular application with recommended configurations:

```bash
npx @ng-nomads/create-ng-application --name my-app
```

## Development

This project uses a monorepo structure powered by npm workspaces.

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ng-nomads-tools.git
   cd ng-nomads-tools
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build all packages:
   ```bash
   npm run build
   ```

### Contributing

Contributions are welcome! Please see our [Contributing Guide](./CONTRIBUTING.md) for more details.

## License

This project is licensed under the Apache-2.0 License - see the [LICENSE](./LICENSE) file for details.