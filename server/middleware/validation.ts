import { Request, Response, NextFunction } from 'express';

const MAX_MESSAGE_LENGTH = 1000;

export const validateMessage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required and must be a string' });
  }

  const trimmedMessage = message.trim();

  if (trimmedMessage.length === 0) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ 
      error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.` 
    });
  }

  // Sanitize and pass along
  req.body.message = trimmedMessage;
  next();
};