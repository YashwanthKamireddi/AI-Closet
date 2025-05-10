/**
 * Weather Routes
 * 
 * These routes handle weather data and weather-based clothing suggestions.
 * They provide weather information and clothing recommendations based on current conditions.
 */

import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth-middleware';
import { storage } from '../../storage';
import { getWeatherForLocation, isAppropriateForWeather } from '../../weather';

const router = Router();

/**
 * @route   GET /api/weather
 * @desc    Get current weather for a location
 * @access  Public
 */
router.get("/", (req: Request, res: Response) => {
  const location = req.query.location as string || "Los Angeles";
  
  getWeatherForLocation(location)
    .then(weather => {
      res.json(weather);
    })
    .catch(error => {
      res.status(500).json({ message: "Failed to fetch weather data", error });
    });
});

/**
 * @route   GET /api/weather/suggestions
 * @desc    Get clothing suggestions based on current weather
 * @access  Private
 */
router.get("/suggestions", requireAuth, async (req: Request, res: Response) => {
  try {
    const location = req.query.location as string || "Los Angeles";
    
    // Get weather data
    const weather = await getWeatherForLocation(location);
    
    if ('error' in weather) {
      return res.status(400).json({ message: weather.message });
    }
    
    // Get user's wardrobe items
    const wardrobeItems = await storage.getWardrobeItems(req.user!.id);
    
    // Filter items appropriate for current weather
    const suggestions = wardrobeItems.filter(item => {
      return isAppropriateForWeather(
        item.category,
        item.subcategory || "",
        weather.type
      );
    });
    
    // Group suggestions by category
    const categorizedSuggestions = suggestions.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, typeof suggestions>);
    
    res.json({
      weather,
      suggestions: categorizedSuggestions
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate weather-based suggestions" });
  }
});

export default router;