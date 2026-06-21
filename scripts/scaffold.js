const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const yamlPath = path.join(rootDir, 'folder-structure.yaml');
const srcDir = path.join(rootDir, 'src');

console.log('Starting scaffold process...');
console.log(`YAML Path: ${yamlPath}`);
console.log(`Src Dir: ${srcDir}`);

if (!fs.existsSync(yamlPath)) {
  console.error(`Error: folder-structure.yaml not found at ${yamlPath}`);
  process.exit(1);
}

const lines = fs.readFileSync(yamlPath, 'utf8').split('\n');

// Standard Templates
const templates = {
  'asset-index': (vars, filePath) => {
    const isSvg = filePath.includes('svg');
    const isGif = filePath.includes('gif');
    const typeStr = isSvg ? 'SVG' : isGif ? 'GIF' : 'Image';
    return `// Export ${typeStr} assets here\nexport const ${isSvg ? 'svgs' : isGif ? 'gifs' : 'images'} = {\n  // Example: logo: require('./image/logo.png'),\n};\n`;
  },
  'hook-stub': (vars, filePath) => {
    const name = path.basename(filePath, '.ts');
    return `// Hook: ${name}\nexport const ${name} = () => {\n  return null;\n};\n`;
  },
  'component': (vars) => {
    const name = vars.name || 'Component';
    const feature = vars.feature || 'feature';
    return `import React from 'react';\nimport { View, Text } from 'react-native';\nimport { styles } from './${feature}.style';\nimport { ${name}Props } from './${feature}Props';\nimport { use${name} } from './use${name}';\n\nexport const ${name}: React.FC<${name}Props> = (props) => {\n  const {} = use${name}(props);\n  return (\n    <View style={styles.container}>\n      <Text>${name} Component</Text>\n    </View>\n  );\n};\n`;
  },
  'style': (vars) => {
    return `import { StyleSheet } from 'react-native';\nimport { colors } from '../../../theme/color';\n\nexport const styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    justifyContent: 'center',\n    alignItems: 'center',\n  },\n});\n`;
  },
  'props': (vars) => {
    const name = vars.name || 'Component';
    return `export interface ${name}Props {\n  children?: React.ReactNode;\n}\n`;
  },
  'hook': (vars) => {
    const name = vars.name || 'Component';
    return `import { ${name}Props } from './${vars.feature || name.toLowerCase()}Props';\n\nexport const use${name} = (props: ${name}Props) => {\n  return {};\n};\n`;
  },
  'screen': (vars) => {
    const name = vars.name || 'Screen';
    const feature = vars.feature || 'screen';
    return `import React from 'react';\nimport { View, Text } from 'react-native';\nimport { styles } from './${feature}.style';\nimport { ${name}Props } from './${feature}Props';\nimport { use${name} } from './use${name}';\n\nexport const ${name}: React.FC<${name}Props> = (props) => {\n  const {} = use${name}(props);\n  return (\n    <View style={styles.container}>\n      <Text>${name} Screen</Text>\n    </View>\n  );\n};\n`;
  },
  'formik': (vars) => {
    const feature = vars.feature || 'form';
    return `export const ${feature}InitialValues = {\n  email: '',\n  password: '',\n};\n`;
  }
};

let currentSection = null;
const folders = [];
const files = [];

// Simple line-by-line stateful YAML parser
let i = 0;
while (i < lines.length) {
  const line = lines[i];
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith('#')) {
    i++;
    continue;
  }

  if (trimmed === 'folders:') {
    currentSection = 'folders';
    i++;
    continue;
  }

  if (trimmed === 'files:') {
    currentSection = 'files';
    i++;
    continue;
  }

  if (currentSection === 'folders') {
    if (trimmed.startsWith('- ')) {
      folders.push(trimmed.substring(2).trim());
    } else if (line.startsWith('  ') === false) {
      currentSection = null;
    }
  }

  if (currentSection === 'files') {
    if (trimmed.startsWith('- path:')) {
      const fileObj = {
        path: trimmed.substring(trimmed.indexOf(':') + 1).trim(),
        template: null,
        content: null,
        vars: {}
      };

      i++;
      // Read sub-properties of this file item
      while (i < lines.length) {
        const subLine = lines[i];
        const subTrimmed = subLine.trim();

        if (!subTrimmed || subTrimmed.startsWith('#')) {
          i++;
          continue;
        }

        // If it starts a new file entry or a new section
        if (subTrimmed.startsWith('- path:') || !subLine.startsWith('    ')) {
          break;
        }

        if (subTrimmed.startsWith('template:')) {
          fileObj.template = subTrimmed.substring(9).trim();
          i++;
        } else if (subTrimmed.startsWith('content: |')) {
          let contentStr = '';
          i++;
          // Read all subsequent lines that are indented relative to this file block
          while (i < lines.length) {
            const contentLine = lines[i];
            // Must have at least 6 spaces of indent (the parent YAML indent was 4)
            if (contentLine.trim() && !contentLine.startsWith('      ')) {
              break;
            }
            // Strip the 6 leading spaces
            contentStr += contentLine.substring(6) + '\n';
            i++;
          }
          fileObj.content = contentStr;
        } else if (subTrimmed.startsWith('vars:')) {
          i++;
          while (i < lines.length) {
            const varLine = lines[i];
            const varTrimmed = varLine.trim();
            if (varTrimmed && !varLine.startsWith('        ')) {
              break;
            }
            if (varTrimmed) {
              const colonIdx = varTrimmed.indexOf(':');
              if (colonIdx !== -1) {
                const key = varTrimmed.substring(0, colonIdx).trim();
                const value = varTrimmed.substring(colonIdx + 1).trim();
                fileObj.vars[key] = value;
              }
            }
            i++;
          }
        } else {
          i++;
        }
      }

      files.push(fileObj);
      continue;
    }
  }

  i++;
}

// 1. Create folders
folders.forEach(folder => {
  const targetDir = path.join(srcDir, folder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`Created directory: src/${folder}`);
  }
});

// 2. Create files
files.forEach(file => {
  const targetPath = path.join(srcDir, file.path);
  const targetDir = path.dirname(targetPath);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  let finalContent = '';
  if (file.content !== null) {
    finalContent = file.content;
  } else if (file.template !== null) {
    const templateFn = templates[file.template];
    if (templateFn) {
      finalContent = templateFn(file.vars, file.path);
    } else {
      console.warn(`Warning: Template '${file.template}' not found for file src/${file.path}`);
    }
  }

  fs.writeFileSync(targetPath, finalContent, 'utf8');
  console.log(`Created file: src/${file.path}`);
});

console.log('Scaffold process completed successfully!');
