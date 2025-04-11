#!/usr/bin/env node
/**
 * create-workspace.js
 *
 * This script creates a new workspace package in the monorepo.
 * Usage: node create-workspace.js -w <workspace-name>
 *
 * Example:
 *   node create-workspace.js -w create-component
 *
 * This will create:
 *   packages/create-component/
 *       package.json
 *       src/index.js
 *
 * The package.json content will be based on a template and include:
 *
 * {
 *   "name": "@ng-nomads/<workspace-name>",
 *   "version": "1.0.0",
 *   "description": "A CLI tool for <description of the workspace>",
 *   "main": "src/index.js",
 *   "bin": {
 *     "<workspace-name>": "src/index.js"
 *   },
 *   "scripts": {
 *     "start": "node src/index.js"
 *   },
 *   "keywords": [],
 *   "author": "bharathmuppa@gmail.com",
 *   "license": "ISC",
 *   "dependencies": {
 *     "commander": "^10.0.0"
 *   }
 * }
 */

const fs = require('fs');
const path = require('path');

// Simple argument parser to pick up the value after "-w" flag.
function parseArgs() {
  const args = process.argv.slice(2);
  let workspaceName = null;
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '-w' || args[i] === '--workspace') && args[i + 1]) {
      workspaceName = args[i + 1];
      break;
    }
  }
  return workspaceName;
}

const workspaceName = parseArgs();

if (!workspaceName) {
  console.error('Error: You must provide a workspace name using -w or --workspace flag.');
  console.error('Usage: node create-workspace.js -w <workspace-name>');
  process.exit(1);
}

// Define the base directory for workspaces (assume monorepo root contains "packages" folder)
const packagesDir = path.join(process.cwd(), 'packages');
const workspaceDir = path.join(packagesDir, workspaceName);

// Create the "packages" directory if it does not exist.
if (!fs.existsSync(packagesDir)) {
  fs.mkdirSync(packagesDir, { recursive: true });
  console.log(`Created packages directory at ${packagesDir}`);
}

// Create the workspace directory.
if (fs.existsSync(workspaceDir)) {
  console.error(`Error: The workspace "${workspaceName}" already exists at ${workspaceDir}.`);
  process.exit(1);
}

fs.mkdirSync(workspaceDir, { recursive: true });
console.log(`Created workspace directory: ${workspaceDir}`);

// Template for package.json
const packageJsonContent = {
  name: `@ng-nomads/${workspaceName}`,
  version: "1.0.0",
  description: "A CLI tool for <description of the workspace>",
  main: "src/index.js",
  author: "bharathmuppa@gmail.com",
  bin: {
    [workspaceName]: "src/index.js"
  },
  scripts: {
    start: "node src/index.js"
  },
  keywords: [],
  license: "ISC",
  dependencies: {
    commander: "^10.0.0"
  }
};

const packageJsonPath = path.join(workspaceDir, 'package.json');
fs.writeFileSync(
  packageJsonPath,
  JSON.stringify(packageJsonContent, null, 2),
  'utf8'
);
console.log(`Created package.json for workspace "${workspaceName}"`);

// Create src directory and index.js file
const srcDir = path.join(workspaceDir, 'src');
if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir, { recursive: true });
  console.log(`Created src directory at ${srcDir}`);
}

const indexJsContent = `#!/usr/bin/env node
// This is the entry point for the @ng-nomads/${workspaceName} CLI tool.
console.log('Hello from @ng-nomads/${workspaceName} CLI!');
`;
const indexJsPath = path.join(srcDir, 'index.js');
fs.writeFileSync(indexJsPath, indexJsContent, 'utf8');
console.log(`Created src/index.js for workspace "${workspaceName}"`);

console.log(`Workspace "${workspaceName}" has been successfully created under ${workspaceDir}.`);
