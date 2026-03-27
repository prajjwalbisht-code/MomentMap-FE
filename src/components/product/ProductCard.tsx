"use client";

import { Product } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    product: Product;
    className?: string;
}

export function ProductCard({ product: p, className }: { product: any; className?: string }) {
    const name = p["Product Name"] || p.name;
    const imageUrl = p["Image URL 1"] || p.imageUrl;
    const category = p.Category || p.category;
    const price = p.price || 0;
    const occasions = p.occasion || p.occasions || [];
    const seasons = p.season || p.seasons || [];

    return (
        <Card className={cn(
            "group overflow-hidden border-none bg-white shadow-ambient hover:shadow-raised hover:scale-[1.02] transition-all duration-700 rounded-[2.5rem]",
            className
        )}>
            <div className="aspect-[3/4] overflow-hidden bg-surface-container-low relative">
                <img
                    src={imageUrl}
                    alt={name}
                    className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute top-6 right-6 flex flex-col gap-2">
                    {Array.isArray(seasons) && seasons.map((s) => (
                        <Badge key={s} className="capitalize text-[9px] font-bold tracking-[0.2em] bg-white/90 backdrop-blur-xl text-foreground border-none px-4 py-1.5 rounded-full shadow-sm">
                            {s}
                        </Badge>
                    ))}
                </div>
            </div>
            <CardContent className="p-8">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-body font-bold text-sm tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{name}</h3>
                    <span className="font-display font-bold text-xl text-primary tracking-tighter">
                        ${(price / 100).toFixed(0)}
                    </span>
                </div>
                <p className="text-[10px] font-body uppercase tracking-[0.3em] text-muted-foreground/40 mb-6 font-bold">{category}</p>
                <div className="flex flex-wrap gap-2">
                    {Array.isArray(occasions) && occasions.slice(0, 2).map((occ) => (
                        <Badge key={occ} className="text-[9px] uppercase tracking-[0.15em] font-normal border-none bg-surface-container-low text-muted-foreground px-3 py-1 rounded-full">
                            {occ}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
