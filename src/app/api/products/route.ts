import { NextResponse } from "next/server";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:3001";

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
        console.log("POST /api/products body:", JSON.stringify(body, null, 2));
        const isArray = Array.isArray(body);
        const validated = isArray
            ? z.array(insertProductSchema).parse(body)
            : insertProductSchema.parse(body);

        console.log(`Forwarding product creation to backend: ${BACKEND_URL}/api/products`);
        const response = await fetch(`${BACKEND_URL}/api/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Connection': 'close'
            },
            body: JSON.stringify(validated),
            cache: 'no-store',
            //@ts-ignore - undici types might not include keepalive in all versions but it's supported
            keepalive: false
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`Backend returned error ${response.status}:`, JSON.stringify(errorData, null, 2));
            return NextResponse.json(
                {
                    message: errorData.message || errorData.error || "Failed to create product in backend",
                    backendError: errorData
                },
                { status: response.status }
            );
        }

        const product = await response.json();
        return NextResponse.json(product, { status: 201 });
    } catch (err: any) {
        console.error("POST /api/products error:", err);
        if (err.cause) {
            console.error("Fetch failure cause:", err.cause);
        }
        if (err instanceof z.ZodError) {
            console.error("Zod Validation Issues:", JSON.stringify(err.issues, null, 2));
            return NextResponse.json({ message: err.issues[0].message, issues: err.issues }, { status: 400 });
        }
        return NextResponse.json({
            message: "Internal Server Error during product creation",
            error: err.message,
            cause: err.cause?.message || err.cause
        }, { status: 500 });
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

        const url = new URL(`${BACKEND_URL}/api/products`);
        if (name) url.searchParams.append("name", name);
        if (styleCode) url.searchParams.append("styleCode", styleCode);

        console.log(`Forwarding deletion to backend: ${url.toString()}`);
        const response = await fetch(url.toString(), {
            method: 'DELETE',
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { message: errorData.message || "Failed to delete product from backend" },
                { status: response.status }
            );
        }

        return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
    } catch (err: any) {
        console.error("Deletion error:", err);
        return NextResponse.json({
            message: "Internal Server Error during deletion",
            error: err.message,
            cause: err.cause?.message || err.cause
        }, { status: 500 });
    }
}
