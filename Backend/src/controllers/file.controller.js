import { prisma } from '../app.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  serverErrorResponse,
  createdResponse,
  fileResponse,
  listResponse,
  paginatedResponse,
  forbiddenResponse
} from '../utils/responseFormatter.js';

class FileController {
  // Upload file
  async uploadFile(req, res) {
    try {
      const ownerId = req.user.id;
      const { fileType } = req.body;

      if (!req.file) {
        return res.status(400).json(errorResponse('No file uploaded', 400));
      }

      if (!fileType) {
        return res.status(400).json(errorResponse('File type is required', 400));
      }

      // Validate file type
      if (!['PROFILE_PICTURE', 'CONSULTATION_RECORDING', 'MEDICAL_DOCUMENT', 'CHAT_MEDIA', 'CERTIFICATION'].includes(fileType)) {
        return res.status(400).json(errorResponse('Invalid file type', 400));
      }

      // Determine upload path based on file type
      let uploadPath = '';
      switch (fileType) {
        case 'PROFILE_PICTURE':
          uploadPath = `/uploads/avatars/${req.file.filename}`;
          break;
        case 'CONSULTATION_RECORDING':
          uploadPath = `/uploads/consultation-recordings/${req.file.filename}`;
          break;
        case 'MEDICAL_DOCUMENT':
          uploadPath = `/uploads/medical-records/${req.file.filename}`;
          break;
        case 'CHAT_MEDIA':
          uploadPath = `/uploads/messages/${req.file.filename}`;
          break;
        case 'CERTIFICATION':
          uploadPath = `/uploads/certifications/${req.file.filename}`;
          break;
        default:
          uploadPath = `/uploads/others/${req.file.filename}`;
      }

      const file = await prisma.file.create({
        data: {
          ownerId: parseInt(ownerId),
          url: uploadPath,
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          fileType
        }
      });

      return res.status(201).json(fileResponse(file));
    } catch (error) {
      console.error('Upload file error:', error);
      return res.status(500).json(serverErrorResponse('Failed to upload file'));
    }
  }

  // Get file by ID
  async getFileById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(errorResponse('File ID is required', 400));
      }

      const file = await prisma.file.findUnique({
        where: { id: parseInt(id) },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        }
      });

      if (!file) {
        return res.status(404).json(notFoundResponse('File not found'));
      }

      return res.json(fileResponse(file));
    } catch (error) {
      console.error('Get file error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get file'));
    }
  }

  // Get files by owner
  async getFilesByOwner(req, res) {
    try {
      const { ownerId } = req.params;
      const { fileType } = req.query;

      if (!ownerId) {
        return res.status(400).json(errorResponse('Owner ID is required', 400));
      }

      let whereClause = { ownerId: parseInt(ownerId) };
      if (fileType) {
        whereClause.fileType = fileType;
      }

      const files = await prisma.file.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      });

      return res.json(listResponse(files, 'Files retrieved successfully', files.length));
    } catch (error) {
      console.error('Get files by owner error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get files'));
    }
  }

  // Update file
  async updateFile(req, res) {
    try {
      const { id } = req.params;
      const { url, fileType } = req.body;
      const ownerId = req.user.id;

      if (!id) {
        return res.status(400).json(errorResponse('File ID is required', 400));
      }

      const file = await prisma.file.findUnique({
        where: { id: parseInt(id) }
      });

      if (!file) {
        return res.status(404).json(notFoundResponse('File not found'));
      }

      if (file.ownerId !== parseInt(ownerId)) {
        return res.status(403).json(forbiddenResponse('You can only update your own files'));
      }

      const updateData = {};
      if (url) updateData.url = url;
      if (fileType) {
        if (!['PROFILE_PICTURE', 'CONSULTATION_RECORDING', 'MEDICAL_DOCUMENT', 'CHAT_MEDIA', 'CERTIFICATION'].includes(fileType)) {
          return res.status(400).json(errorResponse('Invalid file type', 400));
        }
        updateData.fileType = fileType;
      }

      const updatedFile = await prisma.file.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      return res.json(fileResponse(updatedFile));
    } catch (error) {
      console.error('Update file error:', error);
      return res.status(500).json(serverErrorResponse('Failed to update file'));
    }
  }

  // Delete file
  async deleteFile(req, res) {
    try {
      const { id } = req.params;
      const ownerId = req.user.id;

      if (!id) {
        return res.status(400).json(errorResponse('File ID is required', 400));
      }

      const file = await prisma.file.findUnique({
        where: { id: parseInt(id) }
      });

      if (!file) {
        return res.status(404).json(notFoundResponse('File not found'));
      }

      if (file.ownerId !== parseInt(ownerId)) {
        return res.status(403).json(forbiddenResponse('You can only delete your own files'));
      }

      await prisma.file.delete({
        where: { id: parseInt(id) }
      });

      return res.json(successResponse(null, 'File deleted successfully'));
    } catch (error) {
      console.error('Delete file error:', error);
      return res.status(500).json(serverErrorResponse('Failed to delete file'));
    }
  }

  // Get all files (admin only)
  async getAllFiles(req, res) {
    try {
      const { page = 1, limit = 50, fileType } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      let whereClause = {};
      if (fileType) {
        whereClause.fileType = fileType;
      }

      const [files, totalCount] = await Promise.all([
        prisma.file.findMany({
          where: whereClause,
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit)
        }),
        prisma.file.count({
          where: whereClause
        })
      ]);

      return res.json(paginatedResponse(files, parseInt(page), parseInt(limit), totalCount, 'All files retrieved successfully'));
    } catch (error) {
      console.error('Get all files error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get all files'));
    }
  }
}

export default new FileController();
