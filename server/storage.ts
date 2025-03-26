import {
  type ClothingItem,
  type InsertClothingItem,
  type UpdateClothingItem,
} from "@shared/schema";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const UPLOAD_DIR = path.join(__dirname, "../uploads");
const ORIGINAL_DIR = path.join(UPLOAD_DIR, "original");
const GENERATED_DIR = path.join(UPLOAD_DIR, "generated");

// Create directories if they don't exist
[UPLOAD_DIR, ORIGINAL_DIR, GENERATED_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export interface IStorage {
  getClothingItem(id: number): Promise<ClothingItem | undefined>;
  getAllClothingItems(): Promise<ClothingItem[]>;
  createClothingItem(item: InsertClothingItem): Promise<ClothingItem>;
  updateClothingItem(
    id: number,
    updates: UpdateClothingItem
  ): Promise<ClothingItem | undefined>;
  saveUploadedImage(base64Data: string, fileName: string): Promise<string>;
  saveGeneratedImage(base64Data: string, fileName: string): Promise<string>;
}

export class MemStorage implements IStorage {
  private clothingItems: Map<number, ClothingItem>;
  private currentId: number;

  constructor() {
    this.clothingItems = new Map();
    this.currentId = 1;
  }

  async getClothingItem(id: number): Promise<ClothingItem | undefined> {
    return this.clothingItems.get(id);
  }

  async getAllClothingItems(): Promise<ClothingItem[]> {
    return Array.from(this.clothingItems.values());
  }

  async createClothingItem(item: InsertClothingItem): Promise<ClothingItem> {
    const id = this.currentId++;
    const now = new Date();
    const clothingItem: ClothingItem = {
      id,
      originalImage: item.originalImage,
      generatedImage: null,
      modelType: item.modelType || "Tự động (mặc định)",
      backgroundType: item.backgroundType || "Studio (mặc định)",
      status: "pending",
      createdAt: now,
    };
    this.clothingItems.set(id, clothingItem);
    return clothingItem;
  }

  async updateClothingItem(
    id: number,
    updates: UpdateClothingItem
  ): Promise<ClothingItem | undefined> {
    const item = this.clothingItems.get(id);
    if (!item) return undefined;

    const updatedItem = { ...item, ...updates };
    this.clothingItems.set(id, updatedItem);
    return updatedItem;
  }

  async saveUploadedImage(base64Data: string, fileName: string): Promise<string> {
    // Remove the data URL prefix if it exists
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Image, "base64");
    
    const uniqueFileName = `${Date.now()}-${fileName}`;
    const filePath = path.join(ORIGINAL_DIR, uniqueFileName);
    
    await fs.promises.writeFile(filePath, buffer);
    return uniqueFileName;
  }

  async saveGeneratedImage(base64Data: string, fileName: string): Promise<string> {
    // Remove the data URL prefix if it exists
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Image, "base64");
    
    const uniqueFileName = `${Date.now()}-${fileName}`;
    const filePath = path.join(GENERATED_DIR, uniqueFileName);
    
    await fs.promises.writeFile(filePath, buffer);
    return `generated/${uniqueFileName}`; // Return path relative to uploads directory
  }
}

export const storage = new MemStorage();
