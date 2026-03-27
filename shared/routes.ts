
import { z } from 'zod';
import { insertProductSchema, insertEventSchema, products, events, fashionIntentSchema } from './schema';

export const errorSchemas = {
    validation: z.object({
        message: z.string(),
        field: z.string().optional(),
    }),
    notFound: z.object({
        message: z.string(),
    }),
    internal: z.object({
        message: z.string(),
    }),
};

export const api = {
    products: {
        list: {
            method: 'GET' as const,
            path: '/api/products',
            input: z.object({
                category: z.string().optional(),
                vibe: z.string().optional(),
                style: z.string().optional(),
                search: z.string().optional()
            }).optional(),
            responses: {
                200: z.array(z.custom<typeof products.$inferSelect>()),
            },
        },
        get: {
            method: 'GET' as const,
            path: '/api/products/:id',
            responses: {
                200: z.custom<typeof products.$inferSelect>(),
                404: errorSchemas.notFound,
            },
        },
        // For demo purposes, allow creating products via API
        create: {
            method: 'POST' as const,
            path: '/api/products',
            input: insertProductSchema,
            responses: {
                201: z.custom<typeof products.$inferSelect>(),
                400: errorSchemas.validation,
            },
        }
    },
    events: {
        list: {
            method: 'GET' as const,
            path: '/api/events',
            input: z.object({
                start: z.string().optional(), // YYYY-MM-DD
                end: z.string().optional()    // YYYY-MM-DD
            }).optional(),
            responses: {
                200: z.array(z.custom<typeof events.$inferSelect>()),
            },
        },
        // AI Trigger Endpoint
        generate: {
            method: 'POST' as const,
            path: '/api/events/generate',
            input: z.object({
                date: z.string(), // YYYY-MM-DD
                context: z.string().optional() // Manual context override
            }),
            responses: {
                200: z.custom<typeof events.$inferSelect>(),
                500: errorSchemas.internal
            }
        }
    },
    recommendations: {
        get: {
            method: 'GET' as const,
            path: '/api/recommendations',
            input: z.object({
                date: z.string(), // YYYY-MM-DD
                tab: z.string().optional() // "Party", "Casual", etc.
            }),
            responses: {
                200: z.array(z.custom<typeof products.$inferSelect>()),
                404: errorSchemas.notFound
            }
        }
    }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
    let url = path;
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (url.includes(`:${key}`)) {
                url = url.replace(`:${key}`, String(value));
            }
        });
    }
    return url;
}

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type FashionIntent = z.infer<typeof fashionIntentSchema>;
