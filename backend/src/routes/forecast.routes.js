import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication to all forecast routes
router.use(authenticate);

// Placeholder routes - to be implemented
router.get('/periods', (req, res) => {
  res.json({ periods: [] });
});

router.get('/', (req, res) => {
  res.json({ forecasts: [] });
});

router.post('/', (req, res) => {
  res.status(201).json({ message: 'Forecast creation endpoint - to be implemented' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Forecast update endpoint - to be implemented' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Forecast deletion endpoint - to be implemented' });
});

export default router;