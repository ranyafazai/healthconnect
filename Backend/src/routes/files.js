import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Upload file
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { url, fileType } = req.body;

    if (!url || !fileType) {
      return res.status(400).json({ error: 'URL and file type are required' });
    }

    const file = await prisma.file.create({
      data: {
        ownerId: req.user.id,
        url,
        fileType
      }
    });

    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Get files for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const files = await prisma.file.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Get file by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const file = await prisma.file.findUnique({
      where: { id: parseInt(id) }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch file' });
  }
});

// Delete file
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.file.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;
