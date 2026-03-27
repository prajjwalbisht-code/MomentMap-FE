
import { db } from "./db";
import { products, events, type Product, type InsertProduct, type Event, type InsertEvent } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
    // Products
    getProducts(): Promise<Product[]>;
    getProduct(id: number): Promise<Product | undefined>;
    createProduct(product: InsertProduct): Promise<Product>;
    deleteProductByName(name: string): Promise<void>;
    deleteProductByStyleCode(styleCode: string): Promise<void>;

    // Events
    getEvents(): Promise<Event[]>;
    getEventByDate(date: string): Promise<Event | undefined>;
    getEventsByDate(date: string): Promise<Event[]>;
    createEvent(event: InsertEvent): Promise<Event>;
    updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event>;
}

export class DatabaseStorage implements IStorage {
    async getProducts(): Promise<Product[]> {
        try {
            return await db.select().from(products);
        } catch (_) {
            return [];
        }
    }

    async getProduct(id: number): Promise<Product | undefined> {
        try {
            const [product] = await db.select().from(products).where(eq(products.id, id));
            return product;
        } catch (_) {
            return undefined;
        }
    }

    async createProduct(insertProduct: InsertProduct): Promise<Product> {
        const [product] = await db.insert(products).values(insertProduct).returning();
        return product;
    }

    async deleteProductByName(name: string): Promise<void> {
        await db.delete(products).where(eq(products.name, name));
    }

    async deleteProductByStyleCode(styleCode: string): Promise<void> {
        const { sql } = await import("drizzle-orm");
        await db.delete(products).where(sql`${products.metadata}->>'styleCode' = ${styleCode}`);
    }

    async getEvents(): Promise<Event[]> {
        try {
            return await db.select().from(events);
        } catch (_) {
            return [];
        }
    }

    async getEventByDate(date: string): Promise<Event | undefined> {
        try {
            const [event] = await db.select().from(events).where(eq(events.date, date));
            return event;
        } catch (_) {
            return undefined;
        }
    }

    async getEventsByDate(date: string): Promise<Event[]> {
        try {
            return await db.select().from(events).where(eq(events.date, date));
        } catch (_) {
            return [];
        }
    }

    async createEvent(insertEvent: InsertEvent): Promise<Event> {
        const [event] = await db.insert(events).values(insertEvent).returning();
        return event;
    }

    async updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event> {
        const [updated] = await db.update(events)
            .set(updates)
            .where(eq(events.id, id))
            .returning();
        return updated;
    }
}

export const storage = new DatabaseStorage();
