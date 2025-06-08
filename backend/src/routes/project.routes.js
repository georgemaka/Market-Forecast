import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication to all project routes
router.use(authenticate);

// Placeholder routes - to be implemented
router.get('/', (req, res) => {
  res.json({ projects: [] });
});

router.post('/', (req, res) => {
  res.status(201).json({ message: 'Project creation endpoint - to be implemented' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Project update endpoint - to be implemented' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Project deletion endpoint - to be implemented' });
});

export default router;