import { Router, Response } from 'express';
import pool from '../db/pool.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get current user profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT user_id, email, username, archetype, push_notifications_flag, admin_flag
       FROM user_info WHERE user_id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.user_id,
      email: user.email,
      username: user.username,
      archetype: user.archetype,
      pushNotifications: user.push_notifications_flag,
      adminFlag: user.admin_flag
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user profile
router.put('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { username, archetype, pushNotifications } = req.body;

  try {
    const result = await pool.query(
      `UPDATE user_info
       SET username = COALESCE($1, username),
           archetype = COALESCE($2, archetype),
           push_notifications_flag = COALESCE($3, push_notifications_flag)
       WHERE user_id = $4
       RETURNING user_id, email, username, archetype, push_notifications_flag, admin_flag`,
      [username, archetype, pushNotifications, req.userId]
    );

    const user = result.rows[0];
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.user_id,
        email: user.email,
        username: user.username,
        archetype: user.archetype,
        pushNotifications: user.push_notifications_flag,
        adminFlag: user.admin_flag
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update current savings (stored in user_financial_profile)
router.put('/savings', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { currentSavings } = req.body;

  if (currentSavings == null || typeof currentSavings !== 'number') {
    return res.status(400).json({ error: 'currentSavings (number) is required' });
  }

  try {
    const result = await pool.query(
      `UPDATE user_financial_profile
       SET current_savings = $1, updated_at = NOW()
       WHERE user_id = $2
       RETURNING current_savings`,
      [currentSavings, req.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'No financial profile yet. Complete the survey first.' });
    }

    res.json({ currentSavings: Number(result.rows[0].current_savings) });
  } catch (error) {
    console.error('Update savings error:', error);
    res.status(500).json({ error: 'Failed to update savings' });
  }
});

export default router;
