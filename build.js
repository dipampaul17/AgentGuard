#!/usr/bin/env node

/**
 * Build script for AgentGuard
 * Creates browser-compatible and minified versions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Building AgentGuard...\n');

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Read the main file
const mainFile = fs.readFileSync('agent-guard.js', 'utf8');

// Create browser-compatible version
console.log('📦 Creating browser build...');
const browserVersion = mainFile
  // Keep everything but ensure window export
  .replace(
    /\/\/ Export for different environments[\s\S]*?}\s*\n\s*}\)\(\);$/,
    `// Export for different environments
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init, updatePrices };
  }
  if (typeof window !== 'undefined') {
    window.AgentGuard = { init, updatePrices };
  }

})();`
  );

fs.writeFileSync(path.join(distDir, 'agent-guard.browser.js'), browserVersion);
console.log('   ✅ Created dist/agent-guard.browser.js');

// Create minified version using terser if available
try {
  console.log('\n📦 Creating minified version...');
  
  // Check if terser is installed
  try {
    require.resolve('terser');
  } catch (e) {
    console.log('   ⚠️  Installing terser for minification...');
    execSync('npm install --no-save terser', { stdio: 'inherit' });
  }
  
  // Minify the browser version
  execSync(`npx terser dist/agent-guard.browser.js -o dist/agent-guard.min.js -c -m --comments false`, {
    stdio: 'pipe'
  });
  
  const originalSize = fs.statSync(path.join(distDir, 'agent-guard.browser.js')).size;
  const minifiedSize = fs.statSync(path.join(distDir, 'agent-guard.min.js')).size;
  const reduction = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
  
  console.log(`   ✅ Created dist/agent-guard.min.js`);
  console.log(`   📊 Size reduction: ${reduction}% (${(originalSize/1024).toFixed(1)}KB → ${(minifiedSize/1024).toFixed(1)}KB)`);
  
} catch (error) {
  console.log('   ❌ Minification failed:', error.message);
  console.log('   💡 Run: npm install terser');
}

// Create CDN-ready version with version in filename
console.log('\n📦 Creating CDN version...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;

// Use minified version if available, otherwise use browser version
const sourceFile = fs.existsSync(path.join(distDir, 'agent-guard.min.js')) 
  ? 'agent-guard.min.js' 
  : 'agent-guard.browser.js';

fs.copyFileSync(
  path.join(distDir, sourceFile),
  path.join(distDir, `agent-guard-${version}.min.js`)
);
console.log(`   ✅ Created dist/agent-guard-${version}.min.js`);

// Create ES module version
console.log('\n📦 Creating ES module version...');
const esModuleVersion = mainFile
  .replace(/\(function\(\) {/, 'const AgentGuard = (() => {')
  .replace(/if \(typeof module !== 'undefined' && module\.exports\) {[\s\S]*?}[\s\S]*?\}\)\(\);/, `
  return { init, updatePrices };
})();

export const { init, updatePrices } = AgentGuard;
export default AgentGuard;`);

fs.writeFileSync(path.join(distDir, 'agent-guard.esm.js'), esModuleVersion);
console.log('   ✅ Created dist/agent-guard.esm.js');

// Create index.html for testing
console.log('\n📄 Creating test page...');
const testHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AgentGuard Browser Test</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            margin-bottom: 1rem;
        }
        .controls {
            display: flex;
            gap: 1rem;
            margin: 2rem 0;
        }
        button {
            background: #007bff;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background: #0056b3;
        }
        .status {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 4px;
            margin: 1rem 0;
            font-family: monospace;
        }
        #logs {
            max-height: 300px;
            overflow-y: auto;
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 4px;
            font-family: monospace;
            font-size: 14px;
        }
        .log-entry {
            margin: 0.5rem 0;
            padding: 0.5rem;
            background: white;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🛡️ AgentGuard Browser Test</h1>
        <p>Test AgentGuard cost protection in the browser.</p>
        
        <div class="status">
            <div>Status: <span id="status">Not initialized</span></div>
            <div>Current Cost: $<span id="cost">0.0000</span></div>
            <div>Limit: $<span id="limit">-</span></div>
        </div>
        
        <div class="controls">
            <button onclick="initialize()">Initialize ($10 limit)</button>
            <button onclick="simulateCall('gpt-3.5-turbo')">GPT-3.5 Call</button>
            <button onclick="simulateCall('gpt-4')">GPT-4 Call</button>
            <button onclick="simulateCall('claude-3-opus')">Claude Opus Call</button>
            <button onclick="runawayLoop()">Runaway Loop (Danger!)</button>
            <button onclick="reset()">Reset</button>
        </div>
        
        <h3>API Call Logs:</h3>
        <div id="logs"></div>
    </div>

    <script src="agent-guard.min.js"></script>
    <script>
        let guard = null;
        
        function updateDisplay() {
            if (guard) {
                document.getElementById('cost').textContent = guard.getCost().toFixed(4);
                document.getElementById('limit').textContent = guard.getLimit();
                
                const logs = guard.getLogs();
                const logsDiv = document.getElementById('logs');
                logsDiv.innerHTML = logs.map((log, i) => 
                    \`<div class="log-entry">
                        #\${i + 1} - \${log.model} - $\${log.cost.toFixed(4)} - \${log.tokens.input}+\${log.tokens.output} tokens
                    </div>\`
                ).join('');
            }
        }
        
        function initialize() {
            guard = AgentGuard.init({ 
                limit: 10,
                silent: false
            });
            document.getElementById('status').textContent = 'Active';
            updateDisplay();
        }
        
        function simulateCall(model) {
            if (!guard) {
                alert('Please initialize AgentGuard first!');
                return;
            }
            
            const response = {
                model: model,
                usage: {
                    prompt_tokens: Math.floor(Math.random() * 1000) + 100,
                    completion_tokens: Math.floor(Math.random() * 1000) + 100,
                }
            };
            
            // AgentGuard intercepts console.log
            console.log('API Response:', response);
            
            setTimeout(updateDisplay, 100);
        }
        
        function runawayLoop() {
            if (!guard) {
                alert('Please initialize AgentGuard first!');
                return;
            }
            
            if (!confirm('This will simulate a runaway loop. AgentGuard should stop it. Continue?')) {
                return;
            }
            
            // Simulate runaway agent
            const interval = setInterval(() => {
                simulateCall('gpt-4');
            }, 100);
            
            // Stop after 10 seconds max
            setTimeout(() => clearInterval(interval), 10000);
        }
        
        function reset() {
            if (guard) {
                guard.reset();
                updateDisplay();
            }
        }
        
        // Auto-update display
        setInterval(() => {
            if (guard) updateDisplay();
        }, 1000);
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(distDir, 'test.html'), testHtml);
console.log('   ✅ Created dist/test.html');

// Summary
console.log('\n✅ Build complete!');
console.log('\n📁 Created files:');
console.log('   - dist/agent-guard.browser.js    (Browser compatible)');
console.log('   - dist/agent-guard.min.js        (Minified)');
console.log(`   - dist/agent-guard-${version}.min.js  (CDN ready)`);
console.log('   - dist/agent-guard.esm.js        (ES Module)');
console.log('   - dist/test.html                 (Test page)');
console.log('\n🌐 Test in browser:');
console.log('   1. cd dist');
console.log('   2. python -m http.server 8000');
console.log('   3. Open http://localhost:8000/test.html');