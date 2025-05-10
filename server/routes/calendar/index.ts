/**
 * Calendar Routes
 * 
 * These routes handle outfit planning for specific dates.
 * Users can schedule outfits for future wear and view their planned outfits by date.
 */

import { Router, Request, Response } from 'express';
import { storage } from '../../storage';
import { requireAuth } from '../../middleware/auth-middleware';

const router = Router();

// Apply authentication middleware to all calendar routes
router.use(requireAuth);

/**
 * @route   GET /api/calendar-outfits
 * @desc    Get planned outfits for a date range
 * @access  Private
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    // In a real implementation, you would fetch outfits planned for specific dates
    // For now, we'll return the user's outfits with mock dates
    const outfits = await storage.getOutfits(req.user!.id);
    
    // Simulate outfits being assigned to days in the requested range
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    const calendarOutfits = outfits.map((outfit, index) => {
      // Distribute outfits across the requested date range
      const date = new Date(start);
      date.setDate(date.getDate() + (index % Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))));
      
      return {
        ...outfit,
        plannedDate: date.toISOString().split('T')[0]
      };
    });
    
    res.json(calendarOutfits);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch calendar outfits" });
  }
});

/**
 * @route   POST /api/calendar-outfits
 * @desc    Schedule an outfit for a specific date
 * @access  Private
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { outfitId, date } = req.body;
    
    if (!outfitId || !date) {
      return res.status(400).json({ message: "Outfit ID and date are required" });
    }

    // Verify outfit exists and belongs to user
    const outfit = await storage.getOutfit(outfitId);
    if (!outfit) {
      return res.status(404).json({ message: "Outfit not found" });
    }

    if (outfit.userId !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // In a real implementation, you would store the outfit planning for this date
    // For now, just return a success message
    res.status(201).json({ 
      message: "Outfit scheduled successfully",
      plannedOutfit: {
        ...outfit,
        plannedDate: date
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to schedule outfit" });
  }
});

export default router;