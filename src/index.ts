import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { login, authenticate } from './api/auth.controller';
import { getMovies, getFunctionSeats, createReservation } from './api/booking.controller';
import { validateTicket, getPendingPayments, reviewPayment } from './api/boxoffice.controller';
import { getDashboardMetrics, createMovie, createFunction, getTheaters } from './api/admin.controller';
import { upload, UPLOAD_DIR } from './config/upload';

if (!process.env.JWT_SECRET?.trim()) {
  throw new Error('JWT_SECRET es obligatorio. Configúralo en el archivo .env.');
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

// Ruta de estado
app.get('/', (req, res) => {
  res.json({ message: 'CineStanley API funcionando correctamente' });
});

// Autenticación
app.post('/api/auth/login', login);

// Cartelera y Reservas (Cliente)
app.get('/api/movies', getMovies);
app.get('/api/theaters', getTheaters);
app.get('/api/functions/:functionId/seats', getFunctionSeats);
app.post(
  '/api/bookings',
  authenticate(['CLIENT', 'ADMIN']),
  upload.single('paymentProofImage'),
  createReservation,
);

// Taquilla / Recepción (Staff)
app.post('/api/boxoffice/validate', authenticate(['STAFF', 'ADMIN']), validateTicket);
app.get('/api/boxoffice/pending', authenticate(['STAFF', 'ADMIN']), getPendingPayments);
app.post('/api/boxoffice/review/:id', authenticate(['STAFF', 'ADMIN']), reviewPayment);

// Administración (Admin)
app.get('/api/admin/metrics', authenticate(['ADMIN']), getDashboardMetrics);
app.post('/api/admin/movies', authenticate(['ADMIN']), createMovie);
app.post('/api/admin/functions', authenticate(['ADMIN']), createFunction);

app.listen(PORT, () => {
  console.log(`CineStanley API ejecutándose en http://localhost:${PORT}`);
});
