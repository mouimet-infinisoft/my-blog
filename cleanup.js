const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readline = require('readline');

// Promisify fs functions
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);

// Configuration
const OLD_ARTICLES_DIR = path.join(process.cwd(), 'src/app/articles');
const OLD_LIB_FILE = path.join(process.cwd(), 'src/lib/articles.ts');

// Logging utility
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warning: (msg) => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask for confirmation
function confirm(question) {
  return new Promise((resolve) => {
    rl.question(`${question} (y/n) `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// Delete a directory recursively
async function deleteDirectory(dir) {
  try {
    const entries = await readdir(dir);
    
    for (const entry of entries) {
      const entryPath = path.join(dir, entry);
      const entryStat = await stat(entryPath);
      
      if (entryStat.isDirectory()) {
        await deleteDirectory(entryPath);
      } else {
        await unlink(entryPath);
        log.info(`Deleted file: ${entryPath}`);
      }
    }
    
    await rmdir(dir);
    log.success(`Deleted directory: ${dir}`);
  } catch (err) {
    log.error(`Failed to delete ${dir}: ${err.message}`);
  }
}

// Main function
async function cleanup() {
  log.info('Starting cleanup...');
  
  // Check if old articles directory exists
  try {
    await stat(OLD_ARTICLES_DIR);
    
    const confirmDelete = await confirm(`Are you sure you want to delete the old articles directory (${OLD_ARTICLES_DIR})?`);
    if (confirmDelete) {
      await deleteDirectory(OLD_ARTICLES_DIR);
    } else {
      log.info('Skipping deletion of old articles directory.');
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      log.info('Old articles directory does not exist.');
    } else {
      log.error(`Error checking old articles directory: ${err.message}`);
    }
  }
  
  // Check if old lib file exists
  try {
    await stat(OLD_LIB_FILE);
    
    const confirmDelete = await confirm(`Are you sure you want to delete the old articles library file (${OLD_LIB_FILE})?`);
    if (confirmDelete) {
      await unlink(OLD_LIB_FILE);
      log.success(`Deleted file: ${OLD_LIB_FILE}`);
    } else {
      log.info('Skipping deletion of old articles library file.');
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      log.info('Old articles library file does not exist.');
    } else {
      log.error(`Error checking old articles library file: ${err.message}`);
    }
  }
  
  log.success('Cleanup completed!');
  rl.close();
}

// Run the cleanup
cleanup().catch(err => {
  log.error(`Cleanup failed with error: ${err.message}`);
  rl.close();
  process.exit(1);
});
