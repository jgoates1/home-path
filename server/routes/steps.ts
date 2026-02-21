import { Router, Response } from 'express';
import pool from '../db/pool';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get user's steps
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT step_id, user_id, step_order, step_name, step_due_date
       FROM steps
       WHERE user_id = $1
       ORDER BY step_order`,
      [req.userId]
    );

    res.json(result.rows.map(s => ({
      id: s.step_id,
      userId: s.user_id,
      order: s.step_order,
      name: s.step_name,
      dueDate: s.step_due_date
    })));
  } catch (error) {
    console.error('Get steps error:', error);
    res.status(500).json({ error: 'Failed to get steps' });
  }
});

// Get specific step
router.get('/:stepId', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { stepId } = req.params;

  try {
    const result = await pool.query(
      `SELECT step_id, user_id, step_order, step_name, step_due_date
       FROM steps
       WHERE step_id = $1 AND user_id = $2`,
      [stepId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Step not found' });
    }

    const step = result.rows[0];
    res.json({
      id: step.step_id,
      userId: step.user_id,
      order: step.step_order,
      name: step.step_name,
      dueDate: step.step_due_date
    });
  } catch (error) {
    console.error('Get step error:', error);
    res.status(500).json({ error: 'Failed to get step' });
  }
});

// Create new step
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { stepOrder, stepName, dueDate } = req.body;

  try {
    if (!stepOrder || !stepName) {
      return res.status(400).json({ error: 'Step order and name are required' });
    }

    const result = await pool.query(
      `INSERT INTO steps (user_id, step_order, step_name, step_due_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.userId, stepOrder, stepName, dueDate]
    );

    const step = result.rows[0];
    res.status(201).json({
      message: 'Step created successfully',
      step: {
        id: step.step_id,
        userId: step.user_id,
        order: step.step_order,
        name: step.step_name,
        dueDate: step.step_due_date
      }
    });
  } catch (error: any) {
    // Handle unique constraint violations
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'A step with this order or name already exists for this user'
      });
    }
    console.error('Create step error:', error);
    res.status(500).json({ error: 'Failed to create step' });
  }
});

// Update step
router.put('/:stepId', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { stepId } = req.params;
  const { stepOrder, stepName, dueDate } = req.body;

  try {
    const result = await pool.query(
      `UPDATE steps
       SET step_order = COALESCE($1, step_order),
           step_name = COALESCE($2, step_name),
           step_due_date = COALESCE($3, step_due_date)
       WHERE step_id = $4 AND user_id = $5
       RETURNING *`,
      [stepOrder, stepName, dueDate, stepId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Step not found' });
    }

    const step = result.rows[0];
    res.json({
      message: 'Step updated successfully',
      step: {
        id: step.step_id,
        userId: step.user_id,
        order: step.step_order,
        name: step.step_name,
        dueDate: step.step_due_date
      }
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'A step with this order or name already exists for this user'
      });
    }
    console.error('Update step error:', error);
    res.status(500).json({ error: 'Failed to update step' });
  }
});

// Delete step
router.delete('/:stepId', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { stepId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM steps WHERE step_id = $1 AND user_id = $2 RETURNING *',
      [stepId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Step not found' });
    }

    res.json({ message: 'Step deleted successfully' });
  } catch (error) {
    console.error('Delete step error:', error);
    res.status(500).json({ error: 'Failed to delete step' });
  }
});

// Get todos for a specific step
router.get('/:stepId/todos', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { stepId } = req.params;

  try {
    const result = await pool.query(
      `SELECT ut.user_id, ut.todo_id, ti.todo_item_name, ut.step_id,
              ut.reminder_date, ut.due_date, ut.current_status
       FROM user_todos ut
       JOIN todo_items ti ON ut.todo_id = ti.todo_id
       WHERE ut.user_id = $1 AND ut.step_id = $2
       ORDER BY ut.due_date`,
      [req.userId, stepId]
    );

    res.json(result.rows.map(t => ({
      userId: t.user_id,
      todoId: t.todo_id,
      todoName: t.todo_item_name,
      stepId: t.step_id,
      reminderDate: t.reminder_date,
      dueDate: t.due_date,
      status: t.current_status
    })));
  } catch (error) {
    console.error('Get step todos error:', error);
    res.status(500).json({ error: 'Failed to get todos for step' });
  }
});

export default router;
