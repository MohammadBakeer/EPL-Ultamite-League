// config.js

import dotenv from 'dotenv';
dotenv.config();

const config = {
    jwtSecret: process.env.JWT_SECRET || "default_secret", 
    db: {
        host: process.env.DB_HOST || 'localhost',
        username: process.env.DB_USER || 'user',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_DATABASE || 'database',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
    },
};

export default config;
