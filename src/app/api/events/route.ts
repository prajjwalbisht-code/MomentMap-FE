import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    try {
        const { storage } = await import("@/lib/storage");
        let events = await storage.getEvents();

        if (start && end) {
            events = events.filter(e => e.date >= start && e.date <= end);
        }

        return NextResponse.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        return NextResponse.json(
            { message: "Internal Server Error fetching events" },
            { status: 500 }
        );
    }
}
