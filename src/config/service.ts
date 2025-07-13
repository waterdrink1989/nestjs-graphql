export const service_name = "nem";

export const mongoURL = process.env.MONGODB_URL || "mongodb://mongodb:27017/nem_db"; // for Docker
// process.env.MONGODB_URL || "mongodb://localhost:27017/nem_db"; // for local
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "ACCESS_TOKEN_SECRET";

export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "REFRESH_TOKEN_SECRET";

export const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15";

export const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7";

export const SMTP_HOST = process.env.SMTP_HOST || "localhost";
export const SMTP_PORT = process.env.SMTP_PORT || "0";
export const SMTP_USER = process.env.SMTP_USER || "";
export const SMTP_PASS = process.env.SMTP_PASS || "";
export const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@nem.com";
