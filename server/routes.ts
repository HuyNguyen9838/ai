import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { fileUploadSchema, insertClothingItemSchema, updateClothingItemSchema } from "@shared/schema";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { generateTryOnImage as generateGeminiImage, initGeminiAPI } from "./services/gemini";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define memory storage for multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Khởi tạo Gemini API ngay khi khởi động
let isGeminiAvailable = initGeminiAPI();

// Gemini AI image generation
async function generateAIImage(clothingItem: any): Promise<string> {
  try {
    console.log(`Đang tạo hình ảnh cho sản phẩm ${clothingItem.id} với:
- Loại người mẫu: ${clothingItem.modelType}
- Nền: ${clothingItem.backgroundType}
- Độ dài prompt: ${clothingItem.promptText?.length || 0} ký tự`);

    let base64Image: string | null = null;
    
    // Kiểm tra xem Gemini có sẵn sàng không
    if (!isGeminiAvailable) {
      // Thử khởi tạo lại Gemini API nếu chưa sẵn sàng
      console.log("Gemini API chưa được khởi tạo, đang thử lại...");
      isGeminiAvailable = initGeminiAPI();
      
      if (!isGeminiAvailable) {
        throw new Error("Không thể khởi tạo Gemini API, vui lòng kiểm tra API key");
      }
    }
    
    // Sử dụng Gemini để tạo hình ảnh
    try {
      console.log("Đang tạo hình ảnh với Gemini API...");
      base64Image = await generateGeminiImage(clothingItem);
      console.log("Đã tạo hình ảnh thành công với Gemini");
    } catch (geminiError) {
      console.error("Lỗi khi tạo hình ảnh với Gemini:", geminiError);
      throw geminiError; 
    }
    
    if (!base64Image) {
      throw new Error("Không nhận được dữ liệu hình ảnh từ Gemini API");
    }
    
    console.log(`Received base64 image data (length: ${base64Image.length} characters)`);
    
    // Save the generated image
    const fileName = `${Date.now()}_generated.jpg`;
    const imagePath = await storage.saveGeneratedImage(`data:image/jpeg;base64,${base64Image}`, fileName);
    
    console.log(`Saved generated image to: ${imagePath}`);
    
    return imagePath;
  } catch (error) {
    console.error("Error generating image:", error);
    // Don't fallback to original image, throw the error instead
    throw error;
  }
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
      dotfiles: "deny" as const,
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
      
      // Extract model, background type and prompt text from request
      const modelType = req.body.modelType || "Tự động (mặc định)";
      const backgroundType = req.body.backgroundType || "Studio (mặc định)";
      const promptText = req.body.promptText || "";

      // Save the image
      const fileName = await storage.saveUploadedImage(base64Data, req.file.originalname);
      
      // Create clothing item record
      const clothingItem = await storage.createClothingItem({
        originalImage: `original/${fileName}`,
        modelType,
        backgroundType,
        promptText
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
        
        // Call the AI service to generate the image with Gemini
        const generatedImagePath = await generateAIImage(clothingItem);

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
      return res.status(500).json({ 
        message: "Failed to generate image", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
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

// Helper function for validating request (local version for api routes)
function validateRequest<T extends z.ZodTypeAny>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
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
