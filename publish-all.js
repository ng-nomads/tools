#!/usr/bin/env node
/**
 * publish-all.js
 *
 * This script iterates through all workspaces (packages) in the "packages" folder,
 * creates a new package.json for the dist folder with proper path adjustments,
 * and publishes from the dist folder without modifying the original package.json.
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
const publishConfig = parentPkg.publishConfig || { access: 'public' };

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

// --- Create new package.json for dist and publish ---
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
  
  // Read the original package.json but don't modify it
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  // Create a new package.json for dist
  const distPkg = {};
  
  // Copy over essential fields from the original package.json
  distPkg.name = pkg.name;
  distPkg.description = pkg.description || '';
  distPkg.version = parentVersion;
  distPkg.license = parentLicense;
  distPkg.author = parentAuthor;
  distPkg.dependencies = pkg.dependencies || {};
  distPkg.peerDependencies = pkg.peerDependencies || {};
  distPkg.publishConfig = publishConfig;
  
  // Set correct paths for the published package
  if (pkg.main && pkg.main.startsWith('src/')) {
    distPkg.main = pkg.main.replace('src/', '');
  } else if (pkg.main) {
    distPkg.main = pkg.main;
  } else {
    distPkg.main = 'index.js';
  }
  
  if (pkg.module && pkg.module.startsWith('src/')) {
    distPkg.module = pkg.module.replace('src/', '');
  } else if (pkg.module) {
    distPkg.module = pkg.module;
  }
  
  if (pkg.types && pkg.types.startsWith('src/')) {
    distPkg.types = pkg.types.replace('src/', '');
  } else if (pkg.types) {
    distPkg.types = pkg.types;
  }
  
  // Update bin paths if they exist
  if (pkg.bin) {
    if (typeof pkg.bin === 'string' && pkg.bin.startsWith('src/')) {
      distPkg.bin = pkg.bin.replace('src/', '');
    } else if (typeof pkg.bin === 'string') {
      distPkg.bin = pkg.bin;
    } else if (typeof pkg.bin === 'object') {
      distPkg.bin = {};
      Object.keys(pkg.bin).forEach(binName => {
        if (pkg.bin[binName].startsWith('src/')) {
          distPkg.bin[binName] = pkg.bin[binName].replace('src/', '');
        } else {
          distPkg.bin[binName] = pkg.bin[binName];
        }
      });
    }
  }
  
  // Merge keywords from parent and original package
  if (pkg.keywords && Array.isArray(pkg.keywords)) {
    distPkg.keywords = [...new Set([...pkg.keywords, ...parentKeywords])];
  } else {
    distPkg.keywords = parentKeywords;
  }
  
  // Write the new package.json to the dist folder only
  const distPackageJson = JSON.stringify(distPkg, null, 2);
  fs.writeFileSync(path.join(distPath, 'package.json'), distPackageJson, 'utf-8');
  
  console.log(`Created dist package.json for ${folderName} with version ${parentVersion}`);
  
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