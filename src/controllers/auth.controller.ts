import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../validators/auth.validator';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.register(validatedData);
    res.status(201).json(result);
  }

  async login(req: Request, res: Response): Promise<void> {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.login(validatedData);
    res.json(result);
  }
}
