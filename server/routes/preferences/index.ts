/**
 * User Preferences Routes
 * 
 * These routes handle weather and mood preferences for clothing.
 * Users can set their preferences for how they like to dress based on weather conditions
 * and their current mood, which influence outfit recommendations.
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { insertWeatherPreferenceSchema, insertMoodPreferenceSchema } from '@shared/schema';
import { storage } from '../../storage';
import { requireAuth } from '../../middleware/auth-middleware';

const router = Router();

// Apply authentication middleware to all preferences routes
router.use(requireAuth);

// Weather preferences routes
/**
 * @route   GET /api/preferences/weather
 * @desc    Get all weather preferences for the authenticated user
 * @access  Private
 */
router.get("/weather", async (req: Request, res: Response) => {
  try {
    const preferences = await storage.getWeatherPreferences(req.user!.id);
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch weather preferences" });
  }
});

/**
 * @route   POST /api/preferences/weather
 * @desc    Create a new weather preference
 * @access  Private
 */
router.post("/weather", async (req: Request, res: Response) => {
  try {
    const preferenceData = insertWeatherPreferenceSchema.parse({
      ...req.body,
      userId: req.user!.id
    });

    const preference = await storage.createWeatherPreference(preferenceData);
    res.status(201).json(preference);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid weather preference data", errors: error.format() });
    }
    res.status(500).json({ message: "Failed to create weather preference" });
  }
});

// Mood preferences routes
/**
 * @route   GET /api/preferences/mood
 * @desc    Get all mood preferences for the authenticated user
 * @access  Private
 */
router.get("/mood", async (req: Request, res: Response) => {
  try {
    const preferences = await storage.getMoodPreferences(req.user!.id);
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch mood preferences" });
  }
});

/**
 * @route   POST /api/preferences/mood
 * @desc    Create a new mood preference
 * @access  Private
 */
router.post("/mood", async (req: Request, res: Response) => {
  try {
    const preferenceData = insertMoodPreferenceSchema.parse({
      ...req.body,
      userId: req.user!.id
    });

    const preference = await storage.createMoodPreference(preferenceData);
    res.status(201).json(preference);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid mood preference data", errors: error.format() });
    }
    res.status(500).json({ message: "Failed to create mood preference" });
  }
});

export default router;