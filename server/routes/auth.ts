import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/pool';
import { generateToken } from '../middleware/auth';

const router = Router();

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  const { email, username, password, archetype } = req.body;

  try {
    // Validate input
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM user_info WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO user_info (email, username, password, archetype, current_savings)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, email, username, archetype, current_savings, push_notifications_flag`,
      [email, username, hashedPassword, archetype || null, 0]
    );

    const user = result.rows[0];
    const token = generateToken(user.user_id);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.user_id,
        email: user.email,
        username: user.username,
        archetype: user.archetype,
        currentSavings: user.current_savings,
        pushNotifications: user.push_notifications_flag
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM user_info WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.user_id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.user_id,
        email: user.email,
        username: user.username,
        archetype: user.archetype,
        currentSavings: user.current_savings,
        pushNotifications: user.push_notifications_flag
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
