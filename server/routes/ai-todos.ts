import { Router, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pool from "../db/pool.js";
import { authenticateToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

// ============================================================================
// PROMPT - Edit this to customize the AI behavior
// ============================================================================
const TODO_GENERATION_PROMPT = `
You are a helpful AI assistant for first-time homebuyers. Based on the user's survey responses,
generate a personalized list of actionable todo items to help them on their journey to homeownership.

Analyze the survey responses and create practical, specific tasks that match their situation.

Return your response as a JSON array with this exact structure:
{
  "todos": [
    {
      "todoItemName": "string (max 50 characters)",
      "priority": "High" | "Medium" | "Low",
      "description": "string (optional, helpful context)"
    }
  ]
}

Generate 5-10 todo items. Focus on practical, actionable steps.
`;
// ============================================================================

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// POST /api/ai/generate-todos - Generate personalized todos from survey responses
router.post(
  "/generate-todos",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      // 1. Fetch user's survey responses
      const surveyResult = await pool.query(
        `SELECT ur.question_id, sq.question_text, ur.response
       FROM user_responses ur
       JOIN survey_questions sq ON ur.question_id = sq.question_id
       WHERE ur.user_id = $1
       ORDER BY ur.question_id`,
        [req.userId],
      );

      if (surveyResult.rows.length === 0) {
        return res.status(400).json({
          error: "No survey responses found. Please complete the survey first.",
        });
      }

      // 2. Format survey data for the prompt
      const surveyData = surveyResult.rows
        .map((row) => `Q: ${row.question_text}\nA: ${row.response}`)
        .join("\n\n");

      const fullPrompt = `${TODO_GENERATION_PROMPT}\n\nSurvey Responses:\n${surveyData}`;

      // 3. Call Gemini API
      const result = await model.generateContent(fullPrompt);
      const responseText = result.response.text();

      // 4. Return the response
      res.json({
        message: "Todos generated successfully",
        response: responseText,
        surveyData: surveyResult.rows,
      });
    } catch (error) {
      console.error("Generate todos error:", error);

      // Check for specific API errors
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          return res
            .status(500)
            .json({ error: "AI service configuration error" });
        }
      }

      res.status(500).json({
        error: "Failed to generate todos",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  },
);

export default router;
