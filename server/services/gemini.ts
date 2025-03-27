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
    // Get the model - using gemini-2.0-pro-vision which is the latest model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-pro-vision",
      generationConfig: {
        temperature: 0.9,
        topP: 0.8,
        maxOutputTokens: 8192,
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
    let promptText = `Task: Create a photorealistic image of a model wearing the clothing item shown in the attached image.

Instructions:
1. The image should be high resolution, professional quality
2. The model should be wearing the exact clothing item shown in the input image
3. Position the model in a natural, catalog-style pose
4. Make sure the clothing fits properly on the model
`;
    
    // Add user prompt if provided
    if (item.promptText) {
      promptText += `\nCustom instructions: ${item.promptText}\n`;
    }
    
    // Add model type and background to prompt if they're not default
    if (item.modelType && item.modelType !== "Tự động (mặc định)") {
      promptText += `\nModel type: ${item.modelType}`;
    }
    
    if (item.backgroundType && item.backgroundType !== "Studio (mặc định)") {
      promptText += `\nBackground setting: ${item.backgroundType}`;
    }
    
    console.log("Generated prompt:", promptText);
    
    // Generate the image
    const result = await model.generateContent([
      promptText,
      imagePart
    ]);
    
    const response = result.response;
    
    // Check if there are parts in the response and they include images
    if (response.candidates && 
        response.candidates[0] && 
        response.candidates[0].content && 
        response.candidates[0].content.parts) {
      
      const parts = response.candidates[0].content.parts;
      
      // Log parts structure for debugging
      console.log("Response parts:", JSON.stringify(parts.map(p => ({
        hasText: 'text' in p,
        hasInlineData: 'inlineData' in p && p.inlineData ? true : false,
        mimeType: 'inlineData' in p && p.inlineData ? p.inlineData.mimeType : undefined
      })), null, 2));
      
      // Find image part
      for (const part of parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          
          if (base64Data) {
            console.log("Found image data in response");
            return base64Data;
          }
        }
      }
      
      // Also check for text part that might contain base64 data
      for (const part of parts) {
        if (part.text) {
          // Try to extract base64 data from text
          const base64Regex = /data:image\/(jpeg|png);base64,([^"]*)/;
          const matches = part.text.match(base64Regex);
          
          if (matches && matches[2]) {
            console.log("Found base64 data in text response");
            return matches[2];
          }
        }
      }
    }
    
    // If we get here, try the text() method as a fallback
    try {
      const text = response.text();
      console.log("Response text length:", text.length);
      
      // Extract the base64 image data from the response
      const base64Regex = /data:image\/(jpeg|png);base64,([^"]*)/;
      const matches = text.match(base64Regex);
      
      if (matches && matches[2]) {
        console.log("Found base64 data in legacy text response");
        return matches[2];
      }
    } catch (err) {
      console.error("Error extracting text from response:", err);
    }
    
    // If we get here, no image data was found
    throw new Error("Không tìm thấy dữ liệu hình ảnh trong phản hồi từ Gemini")
  } catch (error) {
    console.error("Lỗi khi tạo hình ảnh với Gemini:", error);
    throw error;
  }
}