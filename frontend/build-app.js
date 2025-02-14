const { execSync } = require('child_process');

// Set environment variables
process.env.CI = 'false';
process.env.SKIP_PREFLIGHT_CHECK = 'true';
process.env.NODE_ENV = 'production';

try {
  console.log('Building React application...');
  execSync('node ./node_modules/react-scripts/scripts/build.js', {
    stdio: 'inherit',
    env: process.env
  });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
