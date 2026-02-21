import { Router, Response } from 'express';
import pool from '../db/pool';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all survey questions
router.get('/questions', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT question_id, question_text FROM survey_questions ORDER BY question_id'
    );

    res.json(result.rows.map(q => ({
      id: q.question_id,
      text: q.question_text
    })));
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

// Get user's survey responses
router.get('/responses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT ur.question_id, sq.question_text, ur.response, ur.date_submitted, ur.date_updated
       FROM user_responses ur
       JOIN survey_questions sq ON ur.question_id = sq.question_id
       WHERE ur.user_id = $1
       ORDER BY ur.question_id`,
      [req.userId]
    );

    res.json(result.rows.map(r => ({
      questionId: r.question_id,
      questionText: r.question_text,
      response: r.response,
      dateSubmitted: r.date_submitted,
      dateUpdated: r.date_updated
    })));
  } catch (error) {
    console.error('Get responses error:', error);
    res.status(500).json({ error: 'Failed to get responses' });
  }
});

// Submit or update survey response
router.post('/responses', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { questionId, response } = req.body;

  try {
    if (!questionId || !response) {
      return res.status(400).json({ error: 'Question ID and response are required' });
    }

    const result = await pool.query(
      `INSERT INTO user_responses (user_id, question_id, response, date_submitted, date_updated)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, question_id)
       DO UPDATE SET response = $3, date_updated = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.userId, questionId, response]
    );

    res.json({
      message: 'Response saved successfully',
      response: {
        questionId: result.rows[0].question_id,
        response: result.rows[0].response,
        dateSubmitted: result.rows[0].date_submitted,
        dateUpdated: result.rows[0].date_updated
      }
    });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({ error: 'Failed to save response' });
  }
});

// Submit multiple responses at once
router.post('/responses/batch', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { responses } = req.body; // Array of { questionId, response }

  try {
    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({ error: 'Responses array is required' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const item of responses) {
        await client.query(
          `INSERT INTO user_responses (user_id, question_id, response, date_submitted, date_updated)
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT (user_id, question_id)
           DO UPDATE SET response = $3, date_updated = CURRENT_TIMESTAMP`,
          [req.userId, item.questionId, item.response]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'All responses saved successfully' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Batch submit error:', error);
    res.status(500).json({ error: 'Failed to save responses' });
  }
});

export default router;
