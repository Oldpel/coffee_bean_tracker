export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "change-me-in-production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  llmApiUrl: process.env.LLM_API_URL ?? "https://api.openai.com/v1",
  llmApiKey: process.env.LLM_API_KEY ?? "",
  llmModel: process.env.LLM_MODEL ?? "gpt-4o-mini",
  port: parseInt(process.env.PORT || "3000"),
  uploadDir: process.env.UPLOAD_DIR ?? "uploads",
};
