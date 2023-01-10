import express from 'express';
import cors from 'cors';

import uploadRoute from './routes/routes.uploadRoute.js';

const app = express();

app.use(cors())

app.use(express.json());

app.use('/api/uploads', uploadRoute)

app.listen(3000, () => {
    console.log('Server listening on port 3000...');
  });