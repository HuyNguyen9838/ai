import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { ClothingItem } from "../../shared/schema";

// Initialize Google Generative AI with API key
let genAI: GoogleGenerativeAI;

// Initialize Gemini API
export function initGeminiAPI() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("GEMINI_API_KEY không được cung cấp. Tính năng tạo hình ảnh sẽ không hoạt động.");
    return false;
  }
  
  genAI = new GoogleGenerativeAI(apiKey);
  return true;
}

// Helper function to get file as base64
function fileToGenerativePart(filePath: string, mimeType: string) {
  const fileData = fs.readFileSync(filePath);
  return {
    inlineData: {
      data: Buffer.from(fileData).toString("base64"),
      mimeType
    },
  };
}

/**
 * Generate a try-on image using Gemini 2.0
 * 
 * @param item The clothing item
 * @returns The base64 string of the generated image
 */
export async function generateTryOnImage(item: ClothingItem): Promise<string> {
  if (!genAI) {
    if (!initGeminiAPI()) {
      throw new Error("Không thể khởi tạo Gemini API. Vui lòng kiểm tra API key.");
    }
  }

  try {
    // Get the model - using gemini-1.5-pro-vision which supports image generation
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.9,
        topP: 0.8,
        maxOutputTokens: 2048,
      }
    });
    
    // Get the image file path
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const imagePath = path.join(uploadsDir, item.originalImage);
    
    console.log(`Processing image: ${imagePath}`);
    
    // Ensure the file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Không tìm thấy tệp hình ảnh: ${imagePath}`);
    }
    
    // Create image part
    const imagePart = fileToGenerativePart(
      imagePath,
      item.originalImage.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
    );
    
    // Create prompt based on user input and image type
    let promptText = `You are an AI image generation system. Given a clothing item image, create a photorealistic image of a model wearing this clothing item. Return ONLY a base64 encoded image data as data:image/jpeg;base64,DATA_HERE with no other text or explanation.\n\n`;
    
    // Add user prompt if provided
    if (item.promptText) {
      promptText += `User specifications: ${item.promptText}\n\n`;
    }
    
    // Add model type and background to prompt if they're not default
    if (item.modelType && item.modelType !== "Tự động (mặc định)") {
      promptText += `Model should be: ${item.modelType}\n`;
    }
    
    if (item.backgroundType && item.backgroundType !== "Studio (mặc định)") {
      promptText += `Background should be: ${item.backgroundType}\n`;
    }
    
    // Add instructions for high-quality output
    promptText += "\nMake the image photorealistic, high quality and properly fitted to the model. Output ONLY the base64 image data starting with 'data:image/jpeg;base64,' with no other text, no markdown formatting, and no explanations.";
    
    // Generate the image
    const result = await model.generateContent([
      promptText,
      imagePart
    ]);
    
    const response = result.response;
    const text = response.text();
    
    // Extract the base64 image data from the response
    const base64Regex = /data:image\/(jpeg|png);base64,([^"]*)/;
    const matches = text.match(base64Regex);
    
    if (matches && matches[2]) {
      return matches[2];
    } else {
      throw new Error("Không tìm thấy dữ liệu hình ảnh trong phản hồi từ Gemini");
    }
  } catch (error) {
    console.error("Lỗi khi tạo hình ảnh với Gemini:", error);
    throw error;
  }
}