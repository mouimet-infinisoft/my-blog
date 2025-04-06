import fs from 'fs';
import path from 'path';

export interface SocialPostLog {
  timestamp: string;
  platform: string;
  contentId: string;
  contentType: 'article' | 'series';
  success: boolean;
  error?: string;
}

/**
 * Log social media posting activity
 */
export async function logSocialPost(log: SocialPostLog): Promise<void> {
  try {
    // Only log in development mode for now
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    
    const logDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logDir, 'social-posts.json');
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Read existing logs or create empty array
    let logs: SocialPostLog[] = [];
    if (fs.existsSync(logFile)) {
      const fileContent = fs.readFileSync(logFile, 'utf-8');
      logs = JSON.parse(fileContent);
    }
    
    // Add new log entry
    logs.push(log);
    
    // Write updated logs back to file
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2), 'utf-8');
    
    console.log(`Logged social post to ${log.platform} for ${log.contentType} ${log.contentId}`);
  } catch (error) {
    console.error('Error logging social post:', error);
  }
}
