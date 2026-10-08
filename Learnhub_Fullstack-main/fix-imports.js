const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = false;
            
            // Check if file is directly in src/ or inside src/subfolder
            // If in src/subfolder, it needs ../../../shared
            // If in src/, it needs ../../shared
            // Previously they all incorrectly used ../../shared. 
            // In src/ routes/index.ts is depth 2 (src/child) so it needs ../../../
            // Actually src is depth 1, child is depth 2.
            const relativeToSrc = path.relative(path.join(__dirname, 'backend', 'src'), fullPath);
            const depth = relativeToSrc.split(path.sep).length;
            
            let correctImport = '';
            if (depth === 1) { // in backend/src/ -> needs ../../shared
                correctImport = '../../shared';
            } else if (depth === 2) { // in backend/src/controllers/ -> needs ../../../shared
                correctImport = '../../../shared';
            } else if (depth === 3) {
                correctImport = '../../../../shared';
            }

            if (content.includes('../../shared') && correctImport !== '../../shared') {
                content = content.replace(/\.\.\/\.\.\/shared/g, correctImport);
                updated = true;
            }
            if (updated) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDir(path.join(__dirname, 'backend', 'src'));
