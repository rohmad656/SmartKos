import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import kamarRoutes from './routes/kamarRoutes.js';
import penghuniRoutes from './routes/penghuniRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/kamar', kamarRoutes);
app.use('/api/penghuni', penghuniRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SmartKos API is running' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
