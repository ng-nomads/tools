#!/usr/bin/env node
/**
 * publish-all.js
 *
 * This script iterates through all workspaces (packages) in the "packages" folder,
 * updates each package.json with common fields from the parent package.json,
 * copies the updated package.json to the dist folder, and then publishes from dist.
 *
 * Usage:
 *   node publish-all.js
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
const publishConfig= parentPkg.publishConfig || {};

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

// --- Update Package JSON in Each Workspace and Publish from Dist ---
packageFolders.forEach((folderName) => {
  const packagePath = path.join(packagesDir, folderName);
  const packageJsonPath = path.join(packagePath, 'package.json');
  const distPath = path.join(packagePath, 'dist');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.warn(`Skipping ${folderName}: package.json not found.`);
    return;
  }
  
  if (!fs.existsSync(distPath)) {
    console.warn(`Skipping ${folderName}: dist directory not found. Make sure to build before publishing.`);
    return;
  }
  
  // Read and update the package.json of the workspace
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  // Update version and other fields
  pkg.version = parentVersion;
  pkg.license = parentLicense;
  pkg.author = parentAuthor;
  pkg.publishConfig = publishConfig;
  pkg.license = parentLicense;
  pkg.author = parentAuthor;
  
  // Remove development-only properties that shouldn't be published
  delete pkg.scripts;
  delete pkg.devDependencies;
  

  // Merge keywords: union of parent's and package's keywords
  if (pkg.keywords && Array.isArray(pkg.keywords)) {
    pkg.keywords = [...new Set([...pkg.keywords, ...parentKeywords])];
  } else {
    pkg.keywords = parentKeywords;
  }
  
  // Save updated package.json to both the workspace and dist folder
  const updatedPackageJson = JSON.stringify(pkg, null, 2);
  fs.writeFileSync(packageJsonPath, updatedPackageJson, 'utf-8');
  fs.writeFileSync(path.join(distPath, 'package.json'), updatedPackageJson, 'utf-8');
  
  console.log(`Updated ${folderName}/package.json with version ${parentVersion}`);
  
  // Copy other necessary files to dist if they exist
  const filesToCopy = ['README.md', 'LICENSE', '.npmignore'];
  filesToCopy.forEach(file => {
    const filePath = path.join(packagePath, file);
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, path.join(distPath, file));
      console.log(`Copied ${file} to dist directory`);
    }
  });
  
  // Create or update .npmignore in dist to prevent nested dist folders
  const npmIgnorePath = path.join(distPath, '.npmignore');
  const npmIgnoreContent = 'dist\n';
  fs.writeFileSync(npmIgnorePath, npmIgnoreContent, 'utf-8');
  
  // Publish the package using npm publish from the dist folder
  try {
    console.log(`Publishing package ${pkg.name || folderName} from dist directory...`);
    execSync('npm publish --access public', { cwd: distPath, stdio: 'inherit' });
    console.log(`Published package ${pkg.name || folderName} successfully.`);
  } catch (err) {
    console.error(`Failed to publish ${pkg.name || folderName}: ${err.message}`);
  }
});