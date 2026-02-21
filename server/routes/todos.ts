import { Router, Response } from 'express';
import pool from '../db/pool';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all available todo items
router.get('/items', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT todo_id, todo_item_name FROM todo_items ORDER BY todo_id'
    );

    res.json(result.rows.map(t => ({
      id: t.todo_id,
      name: t.todo_item_name
    })));
  } catch (error) {
    console.error('Get todo items error:', error);
    res.status(500).json({ error: 'Failed to get todo items' });
  }
});

// Get user's todos
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT ut.user_id, ut.todo_id, ti.todo_item_name, ut.step_id,
              ut.reminder_date, ut.due_date, ut.current_status
       FROM user_todos ut
       JOIN todo_items ti ON ut.todo_id = ti.todo_id
       WHERE ut.user_id = $1
       ORDER BY ut.due_date`,
      [req.userId]
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
    console.error('Get user todos error:', error);
    res.status(500).json({ error: 'Failed to get todos' });
  }
});

// Add todo to user
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { todoId, stepId, reminderDate, dueDate, status } = req.body;

  try {
    if (!todoId) {
      return res.status(400).json({ error: 'Todo ID is required' });
    }

    const result = await pool.query(
      `INSERT INTO user_todos (user_id, todo_id, step_id, reminder_date, due_date, current_status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, todo_id) DO UPDATE
       SET step_id = $3, reminder_date = $4, due_date = $5, current_status = $6
       RETURNING *`,
      [req.userId, todoId, stepId, reminderDate, dueDate, status || 'Pending']
    );

    res.status(201).json({
      message: 'Todo added successfully',
      todo: {
        userId: result.rows[0].user_id,
        todoId: result.rows[0].todo_id,
        stepId: result.rows[0].step_id,
        reminderDate: result.rows[0].reminder_date,
        dueDate: result.rows[0].due_date,
        status: result.rows[0].current_status
      }
    });
  } catch (error) {
    console.error('Add todo error:', error);
    res.status(500).json({ error: 'Failed to add todo' });
  }
});

// Update todo status
router.put('/:todoId', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { todoId } = req.params;
  const { status, reminderDate, dueDate } = req.body;

  try {
    const result = await pool.query(
      `UPDATE user_todos
       SET current_status = COALESCE($1, current_status),
           reminder_date = COALESCE($2, reminder_date),
           due_date = COALESCE($3, due_date)
       WHERE user_id = $4 AND todo_id = $5
       RETURNING *`,
      [status, reminderDate, dueDate, req.userId, todoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({
      message: 'Todo updated successfully',
      todo: {
        userId: result.rows[0].user_id,
        todoId: result.rows[0].todo_id,
        stepId: result.rows[0].step_id,
        reminderDate: result.rows[0].reminder_date,
        dueDate: result.rows[0].due_date,
        status: result.rows[0].current_status
      }
    });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete user todo
router.delete('/:todoId', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { todoId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM user_todos WHERE user_id = $1 AND todo_id = $2 RETURNING *',
      [req.userId, todoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

export default router;
