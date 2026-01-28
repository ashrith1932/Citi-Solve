import express from 'express';
import { submitSupportMessage } from '../controllers/supportController.js';
import { verifyToken } from '../middleware/auth.js';
import { citizenAuth } from '../middleware/citizen.js';

const supportRouter = express.Router();
supportRouter.use(citizenAuth);
supportRouter.post(
  '/submit', 
  verifyToken,
  submitSupportMessage
);

export default supportRouter;