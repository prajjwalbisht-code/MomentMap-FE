"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { Navbar } from "@/components/layout/Navbar";
import { ProductCard } from "@/components/product/ProductCard";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductsPage() {
    const [search, setSearch] = useState("");
    const { data: products, isLoading } = useProducts({ search });

    const categories = ["All", "Dresses", "Tops", "Bags", "Accessories"];
    const [activeCategory, setActiveCategory] = useState("All");

    const ACCESSORY_SUBCATEGORIES = [
        "jewellery", "other accessries", "other accessories", "bracelets",
        "pendents", "pocket squares", "ties", "caps", "necklace",
        "earring", "glasses", "watches", "rings", "anklets", "nailcare"
    ];

    const filteredProducts = Array.isArray(products)
        ? products.filter((p: any) => {
            if (activeCategory === "All") return true;
            const cat = (p.Category || p.category)?.toLowerCase();
            if (activeCategory === "Accessories") {
                return ACCESSORY_SUBCATEGORIES.includes(cat) || cat === "accessories";
            }
            return cat === activeCategory.toLowerCase();
        })
        : [];

    return (
        <div className="min-h-screen bg-surface">
            <Navbar />

            <main className="container mx-auto px-6 py-20 max-w-[1600px]">
                <div className="flex flex-col lg:flex-row justify-between items-end gap-12 mb-20">
                    <div>
                        <h1 className="text-8xl font-display mb-6 tracking-tight font-bold">
                            Digital <span className="italic font-light">Wardrobe</span>
                        </h1>
                        <p className="text-muted-foreground font-body text-xl max-w-lg leading-relaxed">
                            Your collection, elevated. An immersive catalog that frames
                            your wardrobe as a curated gallery of silhouettes.
                        </p>
                    </div>

                    <div className="relative w-full lg:w-[450px]">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                        <Input
                            placeholder="Search your silhouettes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-16 pl-16 pr-8 rounded-full bg-white border-none shadow-ambient focus:ring-2 focus:ring-primary/20 transition-all font-body text-lg"
                        />
                    </div>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-10 custom-scrollbar mb-16">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`
                                px-10 py-4 rounded-full text-[10px] font-bold tracking-[0.3em] uppercase transition-all whitespace-nowrap font-body
                                ${activeCategory === cat
                                    ? "bg-primary text-white shadow-raised scale-105"
                                    : "bg-white text-muted-foreground hover:text-primary shadow-ambient"}
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-48">
                        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                        {filteredProducts?.map((product, index) => (
                            <motion.div
                                key={product["Style Code"] || product.id || index}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.8, ease: "circOut" }}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}

                        {!filteredProducts?.length && (
                            <div className="col-span-full py-48 text-center bg-white/50 rounded-[4rem] shadow-ambient">
                                <p className="text-muted-foreground text-2xl font-display italic">No silhouettes found in this edit.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
