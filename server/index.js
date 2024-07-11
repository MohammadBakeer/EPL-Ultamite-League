import express from 'express';
import cors from 'cors';
import axios from 'axios';
import cron from 'node-cron';
import db from './config/db.js';
import authRouter from './routes/authRoutes.js';
import fieldRouter from'./routes/fieldRoutes.js'
import tableRouter from './routes/tableRoutes.js'
import leaderboardRouter from './routes/leaderboardRoutes.js'
import pagesRouter from './routes/pagesRoutes.js'
import predictions from './routes/predictionRoutes.js'
import bodyParser from 'body-parser';
import { synchronizeData } from './services/cron.js'

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json({ limit: '10mb' })); // Adjust limit as per your needs
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());
app.use(express.json());

// Schedule the synchronization task
cron.schedule('0 * * * *', synchronizeData);


app.use('/auth', authRouter);
app.use('/api', fieldRouter);
app.use('/api', tableRouter)
app.use('/api', leaderboardRouter)
app.use('/api', pagesRouter)
app.use('/api', predictions)



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
