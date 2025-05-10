/**
 * AI Recommendation Routes
 * 
 * These routes provide AI-powered outfit recommendations and style insights.
 * They interface with AI services to generate personalized fashion advice for users.
 */

import { Router, Request, Response } from 'express';
import { storage } from '../../storage';
import { requireAuth } from '../../middleware/auth-middleware';
import aiService from '../../services/ai-service';

const router = Router();

// Apply authentication middleware to all AI routes
router.use(requireAuth);

/**
 * @route   POST /api/ai/outfit-recommendations
 * @desc    Get AI-generated outfit recommendations based on mood, weather, and occasion
 * @access  Private
 */
router.post("/outfit-recommendations", async (req: Request, res: Response) => {
  try {
    const { mood, weather, occasion } = req.body;
    
    if (!mood && !weather && !occasion) {
      return res.status(400).json({ 
        message: "At least one criteria (mood, weather, or occasion) is required for recommendations" 
      });
    }
    
    // Get the user's wardrobe
    const wardrobeItems = await storage.getWardrobeItems(req.user!.id);
    
    if (wardrobeItems.length === 0) {
      return res.status(400).json({ 
        message: "Your wardrobe is empty. Add some items to get recommendations." 
      });
    }
    
    // Generate recommendations using AI service
    const recommendations = await aiService.getOutfitRecommendations({
      wardrobeItems,
      weatherCondition: weather ? { condition: weather, temperature: 0, humidity: 0, precipitation: 0 } : undefined,
      occasion,
      mood
    });
    
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate outfit recommendations" });
  }
});

/**
 * @route   POST /api/ai/occasion-outfit
 * @desc    Get AI-generated outfit suggestion for a specific occasion
 * @access  Private
 */
router.post("/occasion-outfit", async (req: Request, res: Response) => {
  try {
    const { occasion, formality, additionalInfo } = req.body;
    
    if (!occasion) {
      return res.status(400).json({ message: "Occasion is required" });
    }
    
    // Get the user's wardrobe
    const wardrobeItems = await storage.getWardrobeItems(req.user!.id);
    
    if (wardrobeItems.length === 0) {
      return res.status(400).json({ 
        message: "Your wardrobe is empty. Add some items to get an outfit suggestion." 
      });
    }
    
    // Generate outfit suggestion for the occasion
    const suggestion = await aiService.getOccasionOutfit({
      occasion: `${occasion} (${formality || "casual"})${additionalInfo ? ` - ${additionalInfo}` : ''}`,
      wardrobeItems
    });
    
    res.json(suggestion);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate outfit suggestion for occasion" });
  }
});

/**
 * @route   GET /api/ai/style-profile
 * @desc    Get AI-generated style profile for the user
 * @access  Private
 */
router.get("/style-profile", async (req: Request, res: Response) => {
  try {
    // Get the user's wardrobe
    const wardrobeItems = await storage.getWardrobeItems(req.user!.id);
    
    if (wardrobeItems.length < 5) {
      return res.status(400).json({ 
        message: "Add at least 5 items to your wardrobe to generate a style profile.",
        itemCount: wardrobeItems.length
      });
    }
    
    // Get user's outfits
    const outfits = await storage.getOutfits(req.user!.id);
    
    // Generate style profile using AI service
    const styleProfile = await aiService.analyzeUserStyle({
      wardrobeItems,
      outfitHistory: outfits
    });
    
    res.json(styleProfile);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate style profile" });
  }
});

/**
 * @route   GET /api/ai/style-analysis
 * @desc    Get AI-generated style analysis for the user
 * @access  Private
 */
router.get("/style-analysis", async (req: Request, res: Response) => {
  try {
    // Get the user's wardrobe
    const wardrobeItems = await storage.getWardrobeItems(req.user!.id);
    
    if (wardrobeItems.length < 3) {
      return res.status(400).json({ 
        message: "Add at least 3 items to your wardrobe to generate a style analysis.",
        itemCount: wardrobeItems.length
      });
    }
    
    // Generate style analysis using AI service
    const analysis = await aiService.analyzeUserStyle({
      wardrobeItems
    });
    
    res.json({
      analysis,
      itemCount: wardrobeItems.length
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate style analysis" });
  }
});

export default router;