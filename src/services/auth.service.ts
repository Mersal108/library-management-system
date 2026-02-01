import bcrypt from 'bcrypt';
import { db } from '../config/database';
import { User, CreateUserDTO, LoginDTO, AuthResponse } from '../types/user.types';
import { generateToken } from '../utils/jwt';
import { UnauthorizedError, ConflictError } from '../utils/errors';

export class AuthService {
  private readonly SALT_ROUNDS = 10; //salting so the password hash is more secure

  async register(data: CreateUserDTO): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await db.oneOrNone<User>(
      'SELECT * FROM users WHERE email = $1',
      [data.email]
    );

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password using the salts we added above
    const password_hash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    // Create user
    const user = await db.one<User>(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, created_at, updated_at`,
      [data.email, password_hash, data.name]
    );

    // Generating a JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    // Find user by email
    const user = await db.oneOrNone<User>(
      'SELECT * FROM users WHERE email = $1',
      [data.email]
    );

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  // this method is used to get user detials by id
  async getUserById(id: number): Promise<Omit<User, 'password_hash'> | null> {
    const user = await db.oneOrNone<User>(
      'SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    return user;
  }
}
