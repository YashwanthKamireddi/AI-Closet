/**
 * Outfits Routes
 * 
 * These routes handle CRUD operations for outfits.
 * Outfits are collections of wardrobe items that users can create and manage.
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { insertOutfitSchema } from '@shared/schema';
import { storage } from '../../storage';
import { requireAuth } from '../../middleware/auth-middleware';

const router = Router();

// Apply authentication middleware to all outfit routes
router.use(requireAuth);

/**
 * @route   GET /api/outfits
 * @desc    Get all outfits for the authenticated user
 * @access  Private
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const outfits = await storage.getOutfits(req.user!.id);
    res.json(outfits);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch outfits" });
  }
});

/**
 * @route   POST /api/outfits
 * @desc    Create a new outfit
 * @access  Private
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const outfitData = insertOutfitSchema.parse({
      ...req.body,
      userId: req.user!.id
    });

    const outfit = await storage.createOutfit(outfitData);
    res.status(201).json(outfit);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid outfit data", errors: error.format() });
    }
    res.status(500).json({ message: "Failed to create outfit" });
  }
});

/**
 * @route   GET /api/outfits/:id
 * @desc    Get a specific outfit by ID
 * @access  Private
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const outfit = await storage.getOutfit(id);

    if (!outfit) {
      return res.status(404).json({ message: "Outfit not found" });
    }

    if (outfit.userId !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(outfit);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch outfit" });
  }
});

/**
 * @route   PATCH /api/outfits/:id
 * @desc    Update an outfit
 * @access  Private
 */
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const outfit = await storage.getOutfit(id);

    if (!outfit) {
      return res.status(404).json({ message: "Outfit not found" });
    }

    if (outfit.userId !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatedOutfit = await storage.updateOutfit(id, req.body);
    res.json(updatedOutfit);
  } catch (error) {
    res.status(500).json({ message: "Failed to update outfit" });
  }
});

/**
 * @route   DELETE /api/outfits/:id
 * @desc    Delete an outfit
 * @access  Private
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const outfit = await storage.getOutfit(id);

    if (!outfit) {
      return res.status(404).json({ message: "Outfit not found" });
    }

    if (outfit.userId !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await storage.deleteOutfit(id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete outfit" });
  }
});

export default router;