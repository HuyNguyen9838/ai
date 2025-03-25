import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { zValidator } from "./validators";
import { fileUploadSchema, insertClothingItemSchema, updateClothingItemSchema } from "@shared/schema";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define memory storage for multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Mock AI image generation (this would be replaced with actual Gemini API in production)
async function generateAIImage(originalImagePath: string, modelType: string, backgroundType: string): Promise<string> {
  // This is where you would call Gemini API
  // For this example, we'll return the original image as a placeholder
  // In a real implementation, you would:
  // 1. Call Gemini API with the image
  // 2. Get back the generated image
  // 3. Save and return the path
  
  // Simulating processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

  // In a real implementation, this would be the result from the Gemini API
  // Here we're just copying the original image to simulate the process
  return originalImagePath;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Set up the uploads directory as a static path
  const uploadsDir = path.join(__dirname, "../uploads");
  app.use("/api/uploads", (req, res, next) => {
    // Log any attempts to access files
    console.log(`Accessed: ${req.url}`);
    next();
  }, 
  (req, res, next) => {
    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    next();
  },
  (req, res, next) => {
    // Serve files from the uploads directory
    const options = {
      root: uploadsDir,
      dotfiles: 'deny',
      headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
      }
    };
    
    const fileName = req.url.slice(1); // Remove leading slash
    res.sendFile(fileName, options, (err) => {
      if (err) {
        next(err);
      }
    });
  });

  // Upload image API
  app.post("/api/upload", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Validate file type
      const fileType = req.file.mimetype;
      if (fileType !== "image/jpeg" && fileType !== "image/png") {
        return res.status(400).json({ message: "Invalid file type. Only JPG and PNG are allowed." });
      }

      // Convert file buffer to base64
      const base64Data = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      
      // Extract model and background type from request
      const modelType = req.body.modelType || "Tự động (mặc định)";
      const backgroundType = req.body.backgroundType || "Studio (mặc định)";

      // Save the image
      const fileName = await storage.saveUploadedImage(base64Data, req.file.originalname);
      
      // Create clothing item record
      const clothingItem = await storage.createClothingItem({
        originalImage: `original/${fileName}`,
        modelType,
        backgroundType
      });

      return res.status(201).json(clothingItem);
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Generate AI image
  app.post("/api/generate/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      // Get the clothing item
      const clothingItem = await storage.getClothingItem(id);
      if (!clothingItem) {
        return res.status(404).json({ message: "Clothing item not found" });
      }

      // Update status to processing
      await storage.updateClothingItem(id, { 
        status: "processing",
        generatedImage: null
      });

      try {
        // Get original image path
        const originalImagePath = clothingItem.originalImage;
        
        // This is where you would call the AI service to generate the image
        // For this MVP, we'll simulate this with a delay and return the original image path
        const generatedImagePath = await generateAIImage(
          originalImagePath,
          clothingItem.modelType,
          clothingItem.backgroundType
        );

        // Update the clothing item with the generated image
        const updatedItem = await storage.updateClothingItem(id, {
          generatedImage: generatedImagePath,
          status: "completed"
        });

        return res.status(200).json(updatedItem);
      } catch (error) {
        // Update status to failed
        await storage.updateClothingItem(id, { 
          status: "failed",
          generatedImage: null
        });
        throw error;
      }
    } catch (error) {
      console.error("Generation error:", error);
      return res.status(500).json({ message: "Failed to generate image" });
    }
  });

  // Get clothing item
  app.get("/api/clothing/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const clothingItem = await storage.getClothingItem(id);
      if (!clothingItem) {
        return res.status(404).json({ message: "Clothing item not found" });
      }

      return res.status(200).json(clothingItem);
    } catch (error) {
      console.error("Get clothing item error:", error);
      return res.status(500).json({ message: "Failed to get clothing item" });
    }
  });

  return httpServer;
}

// Helper function for validating request
function zValidator<T extends z.ZodTypeAny>(schema: T) {
  return async (req: Request, res: Response, next: Function) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      }
      return res.status(400).json({ message: "Invalid request" });
    }
  };
}
