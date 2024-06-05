import dotenv from "dotenv"
dotenv.config();

const _config = {
    port: process.env.PORT,
    databaseUrl: process.env.MONGO_CONNECTION_STRING,
    env: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET,
    cloudinaryCloudName: process.env.CLOUDINAY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINAY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINAY_API_SECRET,
    frontendDomain: process.env.FRONTEND_DOMAIN,
}
export const config = Object.freeze(_config)