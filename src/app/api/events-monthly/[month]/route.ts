import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ month: string }> }
) {
    const { month } = await params;

    try {
        const url = `${BACKEND_URL}/api/events/${month}`;
        console.log(`Fetching events from backend: ${url}`);
        const response = await fetch(url, {
            cache: 'no-store'
        });

        if (!response.ok) {
            return NextResponse.json(
                { message: `Failed to fetch events for ${month} from backend` },
                { status: response.status }
            );
        }

        const body = await response.json();
        const data = body.data || body; // Support both wrapped and unwrapped
        console.log(`Successfully fetched events for ${month}. Day count: ${Object.keys(data).length}`);
        return NextResponse.json(data);
    } catch (error) {
        console.error(`Error fetching events for ${month}:`, error);
        return NextResponse.json(
            { message: "Internal Server Error fetching events" },
            { status: 500 }
        );
    }
}
