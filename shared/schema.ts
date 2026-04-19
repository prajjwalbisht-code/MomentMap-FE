
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category").notNull(),
    price: integer("price").notNull(), // stored in cents
    imageUrl: text("image_url").notNull(),
    styleCode: text("style_code").notNull(),

    // Fashion Attributes
    color: text("color"),
    style: text("style"), // e.g. "streetwear", "formal"
    vibe: text("vibe"), // e.g. "glam", "edgy"
    audience: text("audience"), // e.g. "Gen Z"
    material: text("material"),

    // Additional attributes for matching
    occasion: jsonb("occasion").$type<string[]>(), // e.g. ["party", "casual", "festive"]
    season: jsonb("season").$type<string[]>(), // e.g. ["summer", "monsoon", "winter"]
    silhouette: text("silhouette"), // e.g. "oversized", "fitted", "flowy"
    metadata: jsonb("metadata").$type<Record<string, any>>(), // Detailed fashion attributes

    createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
    id: serial("id").primaryKey(),
    date: text("date").notNull(), // YYYY-MM-DD
    name: text("name").notNull(),
    description: text("description"),

    // Event Metadata
    eventType: text("event_type"), // "festival", "pop-culture", "seasonal", "social"
    intents: jsonb("intents").$type<string[]>(), // ["party", "gifting", "casual", "festive", "travel"]

    // AI Detected Attributes
    audience: text("audience"),
    vibe: jsonb("vibe").$type<string[]>(), // Array of vibe keywords
    fashionKeywords: jsonb("fashion_keywords").$type<{
        colors: string[];
        styles: string[];
        materials: string[];
        designs: string[];
        mood: string[];
    }>(),

    createdAt: timestamp("created_at").defaultNow(),
});

// Schemas
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });

// Types
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

// Fashion Intent keywords structure (from Layer 2)
export const fashionIntentSchema = z.object({
    colors: z.array(z.string()),
    styles: z.array(z.string()),
    materials: z.array(z.string()),
    designs: z.array(z.string()),
    mood: z.array(z.string())
});

export type FashionIntent = z.infer<typeof fashionIntentSchema>;

export * from "./models/chat";
