"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useRecommendations, useGenerateEvent, useMarketingContent } from "@/hooks/use-events";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import {
    Loader2, Sparkles, MapPin, Calendar as CalendarIcon,
    Shirt, Megaphone, Gift, ChevronLeft, ChevronRight,
    Smartphone, Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Event } from "@shared/schema";
import { cn } from "@/lib/utils";

interface EventDialogProps {
    dateStr: string | null;
    events: Event[];
    isOpen: boolean;
    onClose: () => void;
}

type ModalTab = "outfit" | "marketing" | "gifting";

const GIFTING_CATEGORIES = [
    "anklets", "armlets", "bags", "bangles", "body_fragrance", "bracelets",
    "candles_and_candle holders", "clocks", "drinkware", "earrings", "glasses",
    "hair jewellery", "head and hair accessories", "home_decor_accents",
    "jewellery accessories", "necklaces", "other accessories", "picket squares",
    "pocket squares", "rings", "table_accessories", "tableware", "ties",
    "wall_decor", "wallets", "watches"
];

function AestheticPills({ event }: { event: any }) {
    const pills: string[] = [];
    const fk = event.fashion_keywords || event.fashionKeywords;
    if (fk?.mood?.length) pills.push(...fk.mood);
    if (fk?.styles?.length) pills.push(...fk.styles);
    if (fk?.colors?.length) pills.push(...fk.colors);
    if (fk?.color?.length) pills.push(...fk.color);

    const uniquePills = Array.from(new Set(pills));
    if (!uniquePills.length) return null;

    return (
        <div className="mt-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40 mb-3">
                Fashion Aesthetics
            </p>
            <div className="flex flex-wrap gap-2">
                {uniquePills.map((p, i) => (
                    <span
                        key={i}
                        className="px-4 py-1.5 rounded-full bg-surface-container-high text-primary text-[11px] font-bold tracking-tight"
                    >
                        {p}
                    </span>
                ))}
            </div>
        </div>
    );
}

function EventSwitcher({
    events, activeIndex, onSelect,
}: {
    events: any[];
    activeIndex: number;
    onSelect: (i: number) => void;
}) {
    if (events.length <= 1) return null;

    return (
        <div className="flex items-center gap-2 bg-surface-container-low rounded-full px-2 py-2">
            <button
                onClick={() => onSelect(Math.max(0, activeIndex - 1))}
                disabled={activeIndex === 0}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white disabled:opacity-30 transition-all shadow-sm"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {events.map((_, i) => (
                <button
                    key={i}
                    onClick={() => onSelect(i)}
                    className={`w-8 h-8 rounded-full text-[12px] font-bold transition-all ${i === activeIndex
                        ? "bg-primary text-white shadow-raised scale-110"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    {i + 1}
                </button>
            ))}

            <button
                onClick={() => onSelect(Math.min(events.length - 1, activeIndex + 1))}
                disabled={activeIndex === events.length - 1}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white disabled:opacity-30 transition-all shadow-sm"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}

function OutfitTab({ event }: { event: any }) {
    const products = event.products || [];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h4 className="font-display font-bold text-2xl italic">Curated Silhouettes</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <AnimatePresence mode="popLayout">
                    {products.map((p: any, idx: number) => (
                        <motion.div
                            key={p.id || idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <ProductCard product={{
                                ...p,
                                name: p["Product Name"] || p.name,
                                imageUrl: p["Image URL 1"] || p.imageUrl,
                                category: p.Category || p.category,
                                brand: p.Brand || p.brand
                            }} />
                        </motion.div>
                    ))}
                </AnimatePresence>
                {!products.length && (
                    <div className="col-span-2 py-20 text-center text-muted-foreground font-display italic text-lg">
                        No silhouette matches for this event yet.
                    </div>
                )}
            </div>
        </div>
    );
}

function MktCard({ icon: Icon, title, children }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-[2.5rem] p-10 flex flex-col gap-8 shadow-ambient border-none">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-[1.25rem] bg-surface-container-low flex items-center justify-center">
                    <Icon className="w-7 h-7 text-primary" />
                </div>
                <h4 className="font-display font-bold text-2xl tracking-tight">{title}</h4>
            </div>
            <div className="space-y-6">
                {children}
            </div>
        </div>
    );
}

function MarketingTab({ event }: { event: any }) {
    const mkt = event.marketing;

    const appHeadline = mkt?.app?.headline ?? `${event.title || event.name} — Dress the Moment`;
    const appSubtext = mkt?.app?.lines?.[0] ?? "Shop curated fashion looks.";

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            <MktCard icon={Smartphone} title="In-App Editorial">
                <div className="space-y-12">
                    <div>
                        <p className="text-5xl font-display font-bold italic tracking-tighter leading-[0.95] text-primary">
                            {appHeadline}
                        </p>
                    </div>
                    <div className="space-y-6">
                        <p className="text-xl text-muted-foreground/80 font-body leading-relaxed">{appSubtext}</p>
                        {mkt?.app?.lines?.slice(1).map((line: string, i: number) => (
                            <p key={i} className="text-xl text-muted-foreground/80 font-body leading-relaxed">{line}</p>
                        ))}
                    </div>
                </div>
            </MktCard>

            <MktCard icon={Share2} title="Social Narrative">
                <div className="space-y-8">
                    <div className="space-y-10 italic">
                        <p className="text-3xl text-muted-foreground/90 font-display font-medium leading-[1.2] tracking-tight">
                            "{mkt?.social_media?.headline || mkt?.social?.caption}"
                        </p>
                        {mkt?.social_media?.lines?.map((line: string, i: number) => (
                            <p key={i} className="text-3xl text-muted-foreground/90 font-display font-medium leading-[1.2] tracking-tight">"{line}"</p>
                        ))}
                    </div>
                </div>
            </MktCard>
        </div>
    );
}

function GiftingTab({ event }: { event: any }) {
    const products = event.products || [];
    const giftingProducts = products.filter((p: any) => {
        const cat = (p.Category || p.category)?.toLowerCase();
        return GIFTING_CATEGORIES.includes(cat);
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <Gift className="w-8 h-8 text-primary" />
                    <h4 className="font-display font-bold text-2xl italic">Gifting Curation</h4>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <AnimatePresence mode="popLayout">
                    {giftingProducts.map((p: any, idx: number) => (
                        <motion.div
                            key={p.id || idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <ProductCard product={{
                                ...p,
                                name: p["Product Name"] || p.name,
                                imageUrl: p["Image URL 1"] || p.imageUrl,
                                category: p.Category || p.category,
                                brand: p.Brand || p.brand
                            }} />
                        </motion.div>
                    ))}
                </AnimatePresence>
                {!giftingProducts.length && (
                    <div className="col-span-2 py-20 text-center text-muted-foreground font-display italic text-lg">
                        No gifting matches for this event yet.
                    </div>
                )}
            </div>
        </div>
    );
}

export function EventDialog({ dateStr, events, isOpen, onClose }: EventDialogProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<ModalTab>("outfit");
    const generateEvent = useGenerateEvent();

    useEffect(() => {
        setActiveIndex(0);
        setActiveTab("outfit");
    }, [dateStr, isOpen]);

    const event: Event | undefined = events[activeIndex];
    const hasGifting = !!(event?.intents?.includes("gifting"));

    const tabs = [
        { id: "outfit" as ModalTab, label: "Outfit", icon: Shirt },
        { id: "marketing" as ModalTab, label: "Campaign", icon: Megaphone },
        { id: "gifting" as ModalTab, label: "Gifting", icon: Gift },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto border-none glass-morphism p-0 rounded-[4rem]">
                {!events.length ? (
                    <div className="text-center py-32 space-y-8">
                        <h3 className="text-5xl font-display font-bold italic">No events found.</h3>
                        <p className="text-muted-foreground text-xl font-body">Ready to curate a moment?</p>
                        <Button
                            onClick={() => dateStr && generateEvent.mutate(dateStr as any)}
                            disabled={generateEvent.isPending}
                            className="rounded-full px-12 py-8 bg-primary text-white font-bold text-lg shadow-raised"
                        >
                            <Sparkles className="w-6 h-6 mr-3" />
                            Generate Custom Plan
                        </Button>
                    </div>
                ) : !event ? null : (
                    <div className="p-12 space-y-12">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-8">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 text-primary mb-6">
                                    <CalendarIcon className="w-5 h-5" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em]">
                                        {dateStr ? format(new Date(dateStr + "T00:00:00"), "EEEE, MMMM do") : ""}
                                    </span>
                                </div>

                                <DialogTitle className="text-6xl md:text-7xl font-display font-bold tracking-tight mb-4 leading-[0.9]">
                                    {event.name}
                                </DialogTitle>

                                <div className="flex items-center gap-3 text-muted-foreground/40 mb-8 font-bold text-[10px] uppercase tracking-widest">
                                    <MapPin className="w-4 h-4" />
                                    <span>Global Edit / Bengaluru</span>
                                </div>

                                <AestheticPills event={event} />
                            </div>

                            <div className="flex flex-col items-end gap-6">
                                <span className="px-5 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-bold border-none uppercase tracking-widest">
                                    AI Curated
                                </span>
                                <EventSwitcher
                                    events={events}
                                    activeIndex={activeIndex}
                                    onSelect={(i) => { setActiveIndex(i); setActiveTab("outfit"); }}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        {event.description && (
                            <div className="bg-surface-container-high/40 p-8 rounded-[2.5rem] italic font-display text-2xl text-foreground/80 leading-relaxed shadow-sm">
                                "{event.description}"
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="space-y-10">
                            <div className="flex gap-2 bg-surface-container-low p-2 rounded-full w-fit">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 px-8 py-3 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all ${activeTab === tab.id
                                            ? "bg-primary text-white shadow-raised"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${activeTab}-${event.id}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5, ease: "circOut" }}
                                >
                                    {activeTab === "outfit" && <OutfitTab event={event} />}
                                    {activeTab === "marketing" && <MarketingTab event={event} />}
                                    {activeTab === "gifting" && <GiftingTab event={event} />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
