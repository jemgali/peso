import { execSync } from 'child_process';

try {
  console.log('Running prisma generate...');
  const output = execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Done!');
} catch (error) {
  console.error('Failed to run prisma generate:', error);
}
