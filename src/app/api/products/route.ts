import { storage } from "@/lib/storage";
import { NextResponse } from "next/server";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function GET(req: Request) {
    try {
        const url = `${BACKEND_URL}/api/products`;
        console.log(`Fetching products from backend: ${url}`);
        const response = await fetch(url, {
            cache: 'no-store'
        });

        if (!response.ok) {
            return NextResponse.json(
                { message: "Failed to fetch products from backend" },
                { status: response.status }
            );
        }

        const body = await response.json();
        const products = Array.isArray(body) ? body : (body.data || []);

        // Re-apply filters if needed (optional, since backend might handle it)
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const search = searchParams.get("search");

        let filtered = products;
        if (category && category !== "All") {
            filtered = filtered.filter((p: any) => {
                const cat = p.Category || p.category;
                return cat?.toLowerCase() === category.toLowerCase();
            });
        }

        if (search) {
            const s = search.toLowerCase();
            filtered = filtered.filter((p: any) => {
                const name = p["Product Name"] || p.name;
                const desc = p.description || p.Description || "";
                return name?.toLowerCase().includes(s) || desc?.toLowerCase().includes(s);
            });
        }

        return NextResponse.json(filtered);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { message: "Internal Server Error fetching products" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validated = insertProductSchema.parse(body);
        const product = await storage.createProduct(validated);
        return NextResponse.json(product, { status: 201 });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ message: err.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const name = searchParams.get("name");
        const styleCode = searchParams.get("styleCode");

        if (!name && !styleCode) {
            return NextResponse.json({ message: "Name or styleCode is required for deletion" }, { status: 400 });
        }

        if (name) {
            await storage.deleteProductByName(name);
        } else if (styleCode) {
            await storage.deleteProductByStyleCode(styleCode);
        }

        return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
    } catch (err) {
        console.error("Deletion error:", err);
        return NextResponse.json({ message: "Internal Server Error during deletion" }, { status: 500 });
    }
}
