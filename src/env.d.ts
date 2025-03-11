declare namespace NodeJS {
  interface ProcessEnv {
    VERCEL_URL: string;
    VERCEL_WEBHOOK_SECRET: string;
    DEVTO_API_KEY: string;
    LINKEDIN_ACCESS_TOKEN: string;
    LINKEDIN_USER_ID: string;
    ADMIN_API_KEY: string;
  }
}