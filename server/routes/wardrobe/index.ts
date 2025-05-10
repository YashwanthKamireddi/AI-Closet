/**
 * Wardrobe Routes
 * 
 * These routes handle CRUD operations for wardrobe items.
 * Wardrobe items are clothing pieces that users can add to their digital closet.
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { insertWardrobeItemSchema } from '@shared/schema';
import { storage } from '../../storage';
import { requireAuth } from '../../middleware/auth-middleware';

const router = Router();

// Apply authentication middleware to all wardrobe routes
router.use(requireAuth);

/**
 * @route   GET /api/wardrobe
 * @desc    Get all wardrobe items for the authenticated user
 * @access  Private
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const items = await storage.getWardrobeItems(req.user!.id);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wardrobe items" });
  }
});

/**
 * @route   POST /api/wardrobe
 * @desc    Create a new wardrobe item
 * @access  Private
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const itemData = insertWardrobeItemSchema.parse({
      ...req.body,
      userId: req.user!.id
    });

    const item = await storage.createWardrobeItem(itemData);
    res.status(201).json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid wardrobe item data", errors: error.format() });
    }
    res.status(500).json({ message: "Failed to create wardrobe item" });
  }
});

/**
 * @route   GET /api/wardrobe/:id
 * @desc    Get a specific wardrobe item by ID
 * @access  Private
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const item = await storage.getWardrobeItem(id);

    if (!item) {
      return res.status(404).json({ message: "Wardrobe item not found" });
    }

    if (item.userId !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wardrobe item" });
  }
});

/**
 * @route   PATCH /api/wardrobe/:id
 * @desc    Update a wardrobe item
 * @access  Private
 */
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const item = await storage.getWardrobeItem(id);

    if (!item) {
      return res.status(404).json({ message: "Wardrobe item not found" });
    }

    if (item.userId !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatedItem = await storage.updateWardrobeItem(id, req.body);
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: "Failed to update wardrobe item" });
  }
});

/**
 * @route   DELETE /api/wardrobe/:id
 * @desc    Delete a wardrobe item
 * @access  Private
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const item = await storage.getWardrobeItem(id);

    if (!item) {
      return res.status(404).json({ message: "Wardrobe item not found" });
    }

    if (item.userId !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await storage.deleteWardrobeItem(id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete wardrobe item" });
  }
});

export default router;