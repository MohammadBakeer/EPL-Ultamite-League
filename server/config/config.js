// config.js

import dotenv from 'dotenv';
dotenv.config();

const config = {
    jwtSecret: "your_jwt_secret",
    db: {
        host: process.env.DB_HOST || 'localhost',
        username: process.env.DB_USER || 'mohammadbakeer320', 
        password: process.env.DB_PASSWORD || '', 
        database: process.env.DB_DATABASE || 'postgres', 
        port: process.env.DB_PORT || 5432, 
        dialect: 'postgres',
    },
  
}


export default config;


