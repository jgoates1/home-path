import { Router, Response } from 'express';
import pool from '../db/pool.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.use(async (req: AuthRequest, res: Response, next) => {
  try {
    const adminCheck = await pool.query(
      'SELECT admin_flag FROM user_info WHERE user_id = $1',
      [req.userId]
    );

    if (adminCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!adminCheck.rows[0].admin_flag) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Failed to verify admin access' });
  }
});

router.get('/login-activity', async (_req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT user_id, username, last_login
       FROM user_info
       WHERE last_login IS NOT NULL`
    );

    res.json({
      users: result.rows.map((row) => ({
        id: row.user_id,
        username: row.username,
        lastLogin: row.last_login,
      })),
    });
  } catch (error) {
    console.error('Admin login activity error:', error);
    res.status(500).json({ error: 'Failed to load login activity' });
  }
});

export default router;
