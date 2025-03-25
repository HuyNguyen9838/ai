import { pgTable, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the clothing items table
export const clothingItems = pgTable("clothing_items", {
  id: serial("id").primaryKey(),
  originalImage: text("original_image").notNull(),
  generatedImage: text("generated_image"),
  modelType: text("model_type").default("Tự động (mặc định)"),
  backgroundType: text("background_type").default("Studio (mặc định)"),
  promptText: text("prompt_text"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schema for clothing items
export const insertClothingItemSchema = createInsertSchema(clothingItems).pick({
  originalImage: true,
  modelType: true,
  backgroundType: true,
  promptText: true,
});

// Type definitions for our schema
export type InsertClothingItem = z.infer<typeof insertClothingItemSchema>;
export type ClothingItem = typeof clothingItems.$inferSelect;

// Schema for updating a clothing item with generated image
export const updateClothingItemSchema = createInsertSchema(clothingItems).pick({
  generatedImage: true,
  status: true,
  promptText: true,
});

export type UpdateClothingItem = z.infer<typeof updateClothingItemSchema>;

// Valid file types for upload
export const VALID_FILE_TYPES = ["image/jpeg", "image/png"];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// File upload schema validation
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      "Kích thước tệp quá lớn. Tối đa 10MB."
    )
    .refine(
      (file) => VALID_FILE_TYPES.includes(file.type),
      "Loại tệp không hợp lệ. Chỉ chấp nhận JPG, PNG."
    ),
  modelType: z.string().optional(),
  backgroundType: z.string().optional(),
  promptText: z.string().optional(),
});

export type FileUpload = z.infer<typeof fileUploadSchema>;
