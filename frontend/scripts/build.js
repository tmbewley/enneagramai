const { execSync } = require('child_process');
const path = require('path');

// Set environment variables
process.env.CI = 'false';
process.env.SKIP_PREFLIGHT_CHECK = 'true';
process.env.NODE_ENV = 'production';

try {
  console.log('Building React application...');
  
  // Get absolute path to react-scripts build script
  const buildScript = path.resolve(__dirname, '..', 'node_modules', 'react-scripts', 'scripts', 'build.js');
  console.log('Using build script at:', buildScript);
  
  // Execute the build script
  execSync(`node "${buildScript}"`, {
    stdio: 'inherit',
    env: process.env,
    cwd: path.resolve(__dirname, '..')
  });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
