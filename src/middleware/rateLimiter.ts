import rateLimit from 'express-rate-limit';

export const checkoutRateLimiter = rateLimit({
  windowMs: 900000, //15 minutes
  max: 10,
  message: {
    status: 'error',
    message: 'Too many checkout requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const createBookRateLimiter = rateLimit({
  windowMs: 900000, //15 minutes
  max: 20,
  message: {
    status: 'error',
    message: 'Too many book creation requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
