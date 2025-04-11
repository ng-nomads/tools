#!/usr/bin/env node
/**
 * This is the entry point for the @ng-nomads/create-ng-component CLI tool.
 *
 * Usage:
 *   node script.js <project-key> <folder> <component-name> [options]
 *
 * Options:
 *   -p,  --publishable <value>     (true or false) whether to update the public API file.
 *   -s,  --style <value>           (e.g., "scss" or "css") for component styling (default: "css").
 *   -t,  --test <value>            (e.g., "jasmine+karma", "jest", "playwright") test framework (default: "jasmine+karma").
 *   -sb, --story-book <value>      (true or false) whether to generate the Storybook file.
 *   -f,  --flat                  (flag) create the component file without a separate folder.
 *   -c,  --change-detection <value> (e.g., "OnPush", "Default") change detection strategy (default: "OnPush").
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// --- Parse Command Line Arguments ---
const args = process.argv.slice(2);
let positional = [];
let options = {};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('-')) {
    if (arg === '-p' || arg === '--publishable') {
      options.publishable = args[i + 1];
      i++;
    } else if (arg === '-s' || arg === '--style') {
      options.style = args[i + 1];
      i++;
    } else if (arg === '-t' || arg === '--test') {
      options.test = args[i + 1];
      i++;
    } else if (arg === '-sb' || arg === '--story-book') {
      options.storyBook = args[i + 1];
      i++;
    } else if (arg === '-f' || arg === '--flat') {
      options.flat = true;
    } else if (arg === '-c' || arg === '--change-detection') {
      options.changeDetection = args[i + 1];
      i++;
    } else {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    }
  } else {
    positional.push(arg);
  }
}

if (positional.length < 3) {
  console.error('Usage: node script.js <project-key> <folder> <component-name> [options]');
  process.exit(1);
}

const [projectKey, folder, componentName] = positional;
const publishable = (options.publishable && options.publishable.toLowerCase() === 'true') ? true : false;
const storyBook = (options.storyBook && options.storyBook.toLowerCase() === 'true') ? true : false;
const styleOption = options.style || 'css';
const testFramework = options.test || 'jasmine+karma';
const changeDetectionOption = options.changeDetection || 'OnPush';
const flatOption = options.flat ? ' --flat' : '';

// --- Helper Functions ---
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directory "${dirPath}" created.`);
  }
};

const toPascalCase = (name) => {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
};

// --- Main Function ---
const generateComponent = (projectKey, folder, componentName, publishable, style, test, storyBook, changeDetection) => {
  // Save the original working directory (project root)
  const originalCwd = process.cwd();

  try {
    // Read and parse the angular.json file
    const angularJsonPath = path.join(originalCwd, 'angular.json');
    const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));

    // Retrieve the project configuration for the specified project key
    const projectConfig = angularJson.projects[projectKey];
    if (!projectConfig) {
      throw new Error(`Project "${projectKey}" not found in angular.json`);
    }
    const sourceRoot = projectConfig.sourceRoot;
    const projectType = projectConfig.projectType;

    if (!sourceRoot) {
      throw new Error(`"sourceRoot" not defined for project "${projectKey}"`);
    }
    if (!projectType) {
      throw new Error(`"projectType" not defined for project "${projectKey}"`);
    }

    // Determine the base path based on project type.
    const basePath = path.join(sourceRoot, projectType === 'library' ? 'lib' : 'app');

    // Construct the full component path
    const componentPath = path.join(basePath, folder, componentName);

    // Generate the component using Angular CLI with additional options:
    // --style, --flat (if set), and --change-detection.
    execSync(
      `ng g c ${folder}/${componentName} --project=${projectKey} --style=${style}${flatOption} --change-detection=${changeDetection}`,
      { stdio: 'inherit' }
    );

    // Ensure the directory exists (manually check and create if needed)
    ensureDirectoryExists(componentPath);

    // Navigate to the generated component directory
    process.chdir(componentPath);

    // Convert componentName to PascalCase for naming in code
    const pascalCaseComponentName = toPascalCase(componentName);

    // If the storyBook option is true, create the Storybook file (.stories.ts)
    if (storyBook) {
      const storiesContent = `import { Meta, StoryObj } from '@storybook/angular';
import { ${pascalCaseComponentName}Component } from './${componentName}.component';

/* Additional Options:
   Style: ${style}
   Test Framework: ${test}
   Change Detection: ${changeDetection}
*/
const meta: Meta<${pascalCaseComponentName}Component> = {
  title: 'Enterprise Components/<category>/${pascalCaseComponentName}',
  component: ${pascalCaseComponentName}Component,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Component is used to <description here>.',
      },
    },
  },
  argTypes: {},
};

export default meta;
type Story = StoryObj<${pascalCaseComponentName}Component>;

export const Primary: Story = {
  args: {},
};
`;
      fs.writeFileSync(`${componentName}.stories.ts`, storiesContent);
      console.log(`Created ${componentName}.stories.ts`);
    } else {
      console.log('Storybook generation skipped.');
    }

    // Create the ADR markdown file (.component.md)
    const readmeContent = `# ADR: ${pascalCaseComponentName} Component

**Status:** [Proposed | Accepted | Rejected | Deprecated]
**Date:** [Insert Date]
**Decision Owner:** [Team or Individual Responsible]

---

## Context and Problem Statement

[Provide a brief overview of the problem or context that necessitates this decision. Describe the technical or business issue, its impact, and why it requires attention.]

---

## Decision

[Clearly state the decision made. Include key points that highlight the chosen approach or solution.]

---

### Key Considerations

- Style: ${style}
- Test Framework: ${test}
- Change Detection: ${changeDetection}
- Storybook Generation: ${storyBook}

---

## Alternatives Considered

1. **[Alternative Option 1]**
   - **Pros:** [List advantages]
   - **Cons:** [List disadvantages]

2. **[Alternative Option 2]**
   - **Pros:** [List advantages]
   - **Cons:** [List disadvantages]

[Add more alternatives as necessary.]

---

## Rationale

[Provide justification for the selected approach. Explain why this decision was made over others, referencing the pros/cons above and any key considerations.]

---

## Consequences

- **Positive:**
  - [List benefits of the decision.]
- **Negative:**
  - [List potential drawbacks or challenges.]

---

## Implementation

[Outline the steps or actions needed to implement this decision. Include high-level details about tasks, teams, or timelines.]

---

**Decision:** [Restate the chosen decision for clarity.]

---
`;
    fs.writeFileSync(`${componentName}.component.md`, readmeContent);
    console.log(`Created ${componentName}.component.md`);

    // Navigate back to the original working directory (project root)
    process.chdir(originalCwd);

    // Update the public API file only if the publishable flag is true
    if (publishable) {
      if (projectType === 'library') {
        // Build the path to public-api.ts in <project>/src/public-api.ts.
        const publicApiFilePath = projectConfig.root
          ? path.join(originalCwd, projectConfig.root, 'src', 'public-api.ts')
          : path.join(originalCwd, sourceRoot, 'public-api.ts');

        // Build the export statement
        const exportStatement = `export * from './lib/${folder}/${componentName}/${componentName}.component';`;

        if (fs.existsSync(publicApiFilePath)) {
          let existingContent = fs.readFileSync(publicApiFilePath, 'utf8');
          if (!existingContent.includes(exportStatement)) {
            existingContent += `\n${exportStatement}`;
            fs.writeFileSync(publicApiFilePath, existingContent);
            console.log(`Updated public-api.ts with export for ${componentName}.`);
          } else {
            console.log(`Export for ${componentName} already exists in public-api.ts.`);
          }
        } else {
          console.error(`public-api.ts not found at ${publicApiFilePath}`);
        }
      } else if (projectType === 'application') {
        // For applications, update an index.ts file in the sourceRoot.
        const indexFilePath = path.join(originalCwd, sourceRoot, 'index.ts');
        const exportStatement = `export * from './${componentName}.component';`;

        if (fs.existsSync(indexFilePath)) {
          let existingContent = fs.readFileSync(indexFilePath, 'utf8');
          if (!existingContent.includes(exportStatement)) {
            existingContent += `\n${exportStatement}`;
            fs.writeFileSync(indexFilePath, existingContent);
            console.log(`Updated index.ts with export for ${componentName}.`);
          } else {
            console.log(`Export for ${componentName} already exists in index.ts.`);
          }
        } else {
          console.error(`index.ts not found at ${indexFilePath}`);
        }
      }
    } else {
      console.log('Publishable flag not set. Skipping public API update.');
    }

    console.log(
      `Component "${componentName}" created successfully in "${folder}" under the project "${projectKey}".`
    );
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// --- Main Execution ---
generateComponent(
  projectKey,
  folder,
  componentName,
  publishable,
  styleOption,
  testFramework,
  storyBook,
  changeDetectionOption
);
