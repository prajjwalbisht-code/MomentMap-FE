"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Product } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useProducts } from "@/hooks/use-products";

interface ProductCardProps {
    product: Product;
    className?: string;
}

export function ProductCard({ product: p, className }: { product: any; className?: string }) {
    const name = p["Product Name"] || p.product_name || p.name;
    const rawImageUrl = p["Image URL 1"] || p.image_url_1 || p.imageUrl;
    const category = p.Category || p.category;
    const brand = p.Brand || p.brand;
    const styleCode = p["Style Code"] || p.style_code || p.stylecode;
    const occasions = p.occasion || p.occasions || [];
    const seasons = p.season || p.seasons || [];

    const { data: catalogResponse } = useProducts();
    const catalogProducts = catalogResponse?.data || catalogResponse;

    const imageUrl = useMemo(() => {
        if (rawImageUrl && rawImageUrl !== "") return rawImageUrl;
        if (!styleCode || !Array.isArray(catalogProducts)) return rawImageUrl;

        const found = catalogProducts.find((cp: any) =>
            (cp.style_code === styleCode || cp.stylecode === styleCode)
        );
        return found?.image_url_1 || found?.imageurl || rawImageUrl;
    }, [rawImageUrl, styleCode, catalogProducts]);

    const [isImageLoading, setIsImageLoading] = useState(true);
    const [hasEnteredView, setHasEnteredView] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    // Reset loading state when the image URL changes
    useEffect(() => {
        setIsImageLoading(true);
    }, [imageUrl]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setHasEnteredView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "200px" } // Load slightly before coming into view
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <Card
            ref={cardRef}
            className={cn(
                "group overflow-hidden border-none bg-white shadow-ambient hover:shadow-raised hover:scale-[1.02] transition-all duration-700 rounded-[2.5rem]",
                className
            )}
        >
            <div className="aspect-[3/4] overflow-hidden bg-surface-container-low relative">
                {isImageLoading && (
                    <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
                )}
                <img
                    key={imageUrl}
                    src={hasEnteredView ? imageUrl : undefined}
                    alt={name}
                    onLoad={() => setIsImageLoading(false)}
                    className={cn(
                        "object-cover w-full h-full transition-all duration-1000 group-hover:scale-110",
                        isImageLoading || !hasEnteredView ? "opacity-0 scale-105" : "opacity-100 scale-100"
                    )}
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
                <div className="flex flex-col gap-1 mb-3">
                    {brand && <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em]">{brand}</p>}
                    <h3 className="font-body font-bold text-sm tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{name}</h3>
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
