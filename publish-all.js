#!/usr/bin/env node
/**
 * publish-all.js
 *
 * This script iterates through all workspaces (packages) in the "packages" folder,
 * updates each package.json with common fields from the parent package.json,
 * and then publishes each package.
 *
 * Usage:
 *   node publish-all.js
 *
 * This script uses Node's built-in modules and cross-platform file system paths.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// --- Read Parent Package Information ---
const parentPackageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(parentPackageJsonPath)) {
  console.error('Parent package.json not found in the current directory.');
  process.exit(1);
}

const parentPkg = JSON.parse(fs.readFileSync(parentPackageJsonPath, 'utf-8'));
const parentVersion = parentPkg.version;
const parentLicense = parentPkg.license;
const parentAuthor = parentPkg.author;
const parentKeywords = parentPkg.keywords || [];

console.log(`Using parent version: ${parentVersion}`);
console.log(`Using parent license: ${parentLicense}`);
console.log(`Using parent author: ${parentAuthor}`);

// --- Determine Workspace (Packages) Directory ---
const packagesDir = path.join(process.cwd(), 'packages');
if (!fs.existsSync(packagesDir)) {
  console.error(`Packages directory "${packagesDir}" not found!`);
  process.exit(1);
}

const packageFolders = fs.readdirSync(packagesDir).filter((folder) => {
  const folderPath = path.join(packagesDir, folder);
  return fs.statSync(folderPath).isDirectory();
});

// --- Update Package JSON in Each Workspace and Publish ---
packageFolders.forEach((folderName) => {
  const packagePath = path.join(packagesDir, folderName);
  const packageJsonPath = path.join(packagePath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.warn(`Skipping ${folderName}: package.json not found.`);
    return;
  }

  // Read and update the package.json of the workspace
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  pkg.version = parentVersion;
  // Update other common fields from parent package.json if desired
  pkg.license = parentLicense;
  pkg.author = parentAuthor;
  // Merge keywords: union of parent's and package's keywords
  if (pkg.keywords && Array.isArray(pkg.keywords)) {
    pkg.keywords = [...new Set([...pkg.keywords, ...parentKeywords])];
  } else {
    pkg.keywords = parentKeywords;
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), 'utf-8');
  console.log(`Updated ${folderName}/package.json with version ${parentVersion}`);

  // Publish the package using npm publish in the given package folder.
  try {
    console.log(`Publishing package ${pkg.name || folderName}...`);
    execSync('npm publish', { cwd: packagePath, stdio: 'inherit' });
    console.log(`Published package ${pkg.name || folderName} successfully.`);
  } catch (err) {
    console.error(`Failed to publish ${pkg.name || folderName}: ${err.message}`);
  }
});
