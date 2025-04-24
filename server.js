import express from 'express';
import schoolRoutes from './routes/schoolRoutes.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/', schoolRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});