import express from 'express';
import doctorsRouter from './routes/doctors';

const app = express();
app.use(express.json());

app.use('/api/doctors', doctorsRouter);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});