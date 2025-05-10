/**
 * Inspiration Routes
 * 
 * These routes provide access to fashion inspiration content.
 * Inspirations are publicly available style ideas and tips for all users.
 */

import { Router, Request, Response } from 'express';
import { storage } from '../../storage';

const router = Router();

/**
 * @route   GET /api/inspirations
 * @desc    Get all fashion inspirations
 * @access  Public
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const inspirations = await storage.getInspirations();
    res.json(inspirations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch inspirations" });
  }
});

/**
 * @route   GET /api/inspirations/:id
 * @desc    Get a specific inspiration by ID
 * @access  Public
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const inspiration = await storage.getInspiration(id);

    if (!inspiration) {
      return res.status(404).json({ message: "Inspiration not found" });
    }

    res.json(inspiration);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch inspiration" });
  }
});

export default router;