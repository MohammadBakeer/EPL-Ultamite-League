# EPL-Ultamite-League

How to set up your environment.

1. Clone the design-dev from the repo
2. Add a .env file to the root directory and put in the following connection details for postgres:
    
 
    
    DB_USER=
    DB_HOST=
    DB_DATABASE=
    DB_PASSWORD=
    DB_PORT=
    
    API_TOKEN=

    
3. cd into the server folder and then add a config folder:
    
    In the config folder add 3 files:
    
    1. Config.js: 
        
    
        // config.js
        
        import dotenv from 'dotenv';
        dotenv.config();
        
        const config = {
            jwtSecret: "your_jwt_secret",
            db: {
                host: process.env.DB_HOST || '',
                username: process.env.DB_USER || '', 
                password: process.env.DB_PASSWORD || '', 
                database: process.env.DB_DATABASE || '', 
                port: process.env.DB_PORT || 5432, 
                dialect: 'postgres',
            },
          
        }
        
        export default config;
        

        
        2. db.js:
            
            
            // db.js
            
            import pkg from 'pg';
            const { Pool } = pkg;
            
            import dotenv from 'dotenv';
            dotenv.config();
            
            const pool = new Pool({
              user: process.env.DB_USER,
              host: process.env.DB_HOST,
              database: process.env.DB_DATABASE,
              password: process.env.DB_PASSWORD,
              port: process.env.DB_PORT,
            });
            
            export default pool;
            
        
            
        3. jwtUtils.js:
            
     
            // jwtUtils.js
            
            import jwt from 'jsonwebtoken';
            
            // Function to decode JWT token
            export const decodeJWT = (token) => {
              try {
                // Verify and decode the token
                const decoded = jwt.verify(token, 'your_jwt_secret'); // Replace 'your_jwt_secret' with your actual JWT secret
            
                // Return the decoded payload
                return decoded;
              } catch (error) {
                // Throw an error if JWT verification fails
                throw new Error('JWT verification failed');
              }
            };
     
      
            

4. Run npm i
5. Put all of the tables in setup.sql and add them to the postgres that is connected
6. Copy and past all of the triggers.sql into your postgres that is connected
7. run npm start
