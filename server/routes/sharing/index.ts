/**
 * Outfit Sharing Routes
 * 
 * These routes handle the sharing functionality for outfits.
 * Users can generate shareable links for their outfits,
 * and public endpoints allow viewing shared outfits without authentication.
 */

import { Router, Request, Response } from 'express';
import { storage } from '../../storage';
import { requireAuth } from '../../middleware/auth-middleware';

const router = Router();

/**
 * @route   POST /api/outfits/:id/share
 * @desc    Generate a shareable link for an outfit
 * @access  Private
 */
router.post("/:id/share", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const outfit = await storage.getOutfit(id);

    if (!outfit) {
      return res.status(404).json({ message: "Outfit not found" });
    }

    if (outfit.userId !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    // Generate a sharing token/ID
    const shareId = Buffer.from(`${outfit.id}-${Date.now()}`).toString('base64');
    
    // In a real implementation, store this sharing information in the database
    // await storage.createOutfitShare(outfit.id, shareId);
    
    // Generate a shareable link
    const shareableLink = `${req.protocol}://${req.get('host')}/shared-outfit/${shareId}`;
    
    res.status(200).json({ 
      message: "Outfit shared successfully",
      shareableLink
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to share outfit" });
  }
});

/**
 * @route   GET /api/shared-outfit/:shareId
 * @desc    Get a publicly shared outfit
 * @access  Public
 */
router.get("/shared/:shareId", async (req: Request, res: Response) => {
  try {
    const { shareId } = req.params;
    
    // In a real implementation, get the outfit ID from the share record
    // const share = await storage.getOutfitShareByShareId(shareId);
    // if (!share) {
    //   return res.status(404).json({ message: "Shared outfit not found" });
    // }
    
    // For demo purposes, parse the outfit ID from the share ID
    let outfitId: number;
    try {
      const decoded = Buffer.from(shareId, 'base64').toString();
      outfitId = parseInt(decoded.split('-')[0]);
    } catch (e) {
      return res.status(400).json({ message: "Invalid share ID" });
    }
    
    const outfit = await storage.getOutfit(outfitId);
    if (!outfit) {
      return res.status(404).json({ message: "Shared outfit not found" });
    }
    
    // For shared outfits, we'll need to include item details
    const outfitItems = await Promise.all(
      outfit.items.map(async (itemId) => {
        return await storage.getWardrobeItem(itemId);
      })
    );
    
    // Filter out any null items (in case some items were deleted)
    const validItems = outfitItems.filter(Boolean);
    
    // Return a sanitized version for public sharing
    const publicOutfit = {
      id: outfit.id,
      name: outfit.name,
      items: validItems.map(item => item ? {
        id: item.id,
        name: item.name,
        category: item.category,
        subcategory: item.subcategory,
        color: item.color,
        season: item.season,
        imageUrl: item.imageUrl,
        tags: item.tags
      } : null).filter(Boolean),
      occasion: outfit.occasion || "casual",
      season: outfit.season || "all",
      weatherConditions: outfit.weatherConditions || [],
      mood: outfit.mood || "neutral",
      shared: true
    };
    
    res.json(publicOutfit);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shared outfit" });
  }
});

export default router;