import { Router, Response } from 'express';
import pool from '../db/pool';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get current user profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT user_id, email, username, archetype, current_savings, push_notifications_flag
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
      currentSavings: user.current_savings,
      pushNotifications: user.push_notifications_flag
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user profile
router.put('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { username, archetype, currentSavings, pushNotifications } = req.body;

  try {
    const result = await pool.query(
      `UPDATE user_info
       SET username = COALESCE($1, username),
           archetype = COALESCE($2, archetype),
           current_savings = COALESCE($3, current_savings),
           push_notifications_flag = COALESCE($4, push_notifications_flag)
       WHERE user_id = $5
       RETURNING user_id, email, username, archetype, current_savings, push_notifications_flag`,
      [username, archetype, currentSavings, pushNotifications, req.userId]
    );

    const user = result.rows[0];
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.user_id,
        email: user.email,
        username: user.username,
        archetype: user.archetype,
        currentSavings: user.current_savings,
        pushNotifications: user.push_notifications_flag
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
