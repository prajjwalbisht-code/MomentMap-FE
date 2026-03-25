"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { insertProductSchema } from "@shared/schema";
import { useCreateProduct, useDeleteProduct } from "@/hooks/use-products";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
    Loader2, Plus, Upload, FileSpreadsheet,
    Trash2, Search, Bell, User, Camera, Image as ImageIcon, AlertCircle,
    Info, Palette, Scissors, Globe, Package, Type
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const EXCEL_MAPPING: Record<string, string> = {
    "Style Code": "styleCode",
    "Category": "category",
    "Type": "type",
    "Product Name": "name",
    "Occasion": "occasion",
    "Activity": "activity",
    "Back Style": "backStyle",
    "Brand": "brand",
    "Brand Color": "brandColor",
    "Character": "character",
    "Color": "color",
    "Color 2": "color2",
    "Decor Theme": "decorTheme",
    "Department": "department",
    "Detail": "detail",
    "Distress": "distress",
    "Ethnicity": "ethnicity",
    "Fit": "fit",
    "Hemline Style": "hemlineStyle",
    "Jewellery Pattern": "jewelleryPattern",
    "Length": "length",
    "Lens Color": "lensColor",
    "Material": "material",
    "Neck Work": "neckWork",
    "Neckline": "neckline",
    "Pattern": "pattern",
    "Pattern 2": "pattern2",
    "Pattern 3": "pattern3",
    "Pendants Type": "pendantsType",
    "Size Group": "sizeGroup",
    "Style": "style",
    "Surface Styling": "surfaceStyling",
    "Theme": "theme",
    "Transparency": "transparency",
    "Treatment": "treatment",
    "Image URL 1": "imageUrl",
};

const INITIAL_FORM_STATE = {
    name: "",
    category: "",
    price: "0",
    imageUrl: "",
    style: "",
    color: "",
    material: "",
    styleCode: "",
    type: "0",
    occasion: "casual",
    activity: "loungewear",
    backStyle: "0",
    brand: "",
    brandColor: "0",
    character: "0",
    color2: "n/a",
    decorTheme: "0",
    department: "men",
    detail: "",
    distress: "0",
    ethnicity: "western",
    fit: "0",
    hemlineStyle: "",
    jewelleryPattern: "0",
    length: "",
    lensColor: "0",
    neckWork: "0",
    neckline: "",
    pattern: "",
    pattern2: "n/a",
    pattern3: "n/a",
    pendantsType: "0",
    sizeGroup: "regular",
    surfaceStyling: "",
    theme: "0",
    transparency: "opaque",
    treatment: "0",
};

const FORM_GROUPS = [
    {
        title: "Identification",
        icon: Package,
        fields: [
            { label: "Product Name", key: "name", placeholder: "e.g. Asymmetric Drape Gown" },
            { label: "Style Code", key: "styleCode", placeholder: "MM-24-DRS-09" },
            { label: "Category", key: "category", placeholder: "Dresses" },
            { label: "Brand", key: "brand", placeholder: "The Indian Garage Co" },
            { label: "Department", key: "department", placeholder: "men" },
            { label: "Type", key: "type", placeholder: "0" },
            { label: "Size Group", key: "sizeGroup", placeholder: "regular" },
        ]
    },
    {
        title: "Style Details",
        icon: Scissors,
        fields: [
            { label: "Style", key: "style", placeholder: "relaxed" },
            { label: "Fit", key: "fit", placeholder: "0" },
            { label: "Length", key: "length", placeholder: "knee" },
            { label: "Material", key: "material", placeholder: "0" },
            { label: "Neckline", key: "neckline", placeholder: "crew" },
            { label: "Neck Work", key: "neckWork", placeholder: "0" },
            { label: "Back Style", key: "backStyle", placeholder: "0" },
            { label: "Hemline Style", key: "hemlineStyle", placeholder: "straight" },
            { label: "Detail", key: "detail", placeholder: "ribbed" },
            { label: "Distress", key: "distress", placeholder: "0" },
            { label: "Ethnicity", key: "ethnicity", placeholder: "western" },
            { label: "Treatment", key: "treatment", placeholder: "0" },
        ]
    },
    {
        title: "Visual Attributes",
        icon: Palette,
        fields: [
            { label: "Color", key: "color", placeholder: "black" },
            { label: "Color 2", key: "color2", placeholder: "n/a" },
            { label: "Brand Color", key: "brandColor", placeholder: "0" },
            { label: "Pattern", key: "pattern", placeholder: "self-design" },
            { label: "Pattern 2", key: "pattern2", placeholder: "n/a" },
            { label: "Pattern 3", key: "pattern3", placeholder: "n/a" },
            { label: "Surface Styling", key: "surfaceStyling", placeholder: "jacquard" },
            { label: "Transparency", key: "transparency", placeholder: "opaque" },
            { label: "Jewellery Pattern", key: "jewelleryPattern", placeholder: "0" },
            { label: "Lens Color", key: "lensColor", placeholder: "0" },
            { label: "Pendants Type", key: "pendantsType", placeholder: "0" },
        ]
    },
    {
        title: "Context",
        icon: Globe,
        fields: [
            { label: "Occasion", key: "occasion", placeholder: "casual" },
            { label: "Activity", key: "activity", placeholder: "loungewear" },
            { label: "Character", key: "character", placeholder: "0" },
            { label: "Decor Theme", key: "decorTheme", placeholder: "0" },
            { label: "Theme", key: "theme", placeholder: "0" },
        ]
    },
    {
        title: "Asset",
        icon: ImageIcon,
        fields: [
            { label: "Image URL 1", key: "imageUrl", placeholder: "https://assets..." },
        ]
    }
];

export default function AdminPage() {
    const { toast } = useToast();
    const createProduct = useCreateProduct();
    const deleteProduct = useDeleteProduct();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState("single");
    const [highlightedTab, setHighlightedTab] = useState<string | null>(null);

    const handleTabChange = (id: string) => {
        setActiveTab(id);
        const element = document.getElementById(id);
        if (element) {
            const offset = 100; // Adjust for sticky header
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });

            setHighlightedTab(id);
            setTimeout(() => setHighlightedTab(null), 2000);
        }
    };

    const navItems = [
        { name: "Collections", href: "/products" },
        { name: "Calendar", href: "/calendar" },
        { name: "Admin", href: "/admin" },
    ];
    const [productForm, setProductForm] = useState(INITIAL_FORM_STATE);
    const [deleteInput, setDeleteInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { name, category, price, imageUrl, style, color, material, ...metadata } = productForm;
            const payload = {
                name,
                category,
                price: parseInt(price) * 100,
                imageUrl,
                style,
                color,
                material,
                metadata,
                description: `${name} - A ${color} ${style} ${category} item for ${productForm.department}.`,
            };
            await createProduct.mutateAsync(payload as any);
            toast({ title: "Silhouette Catalogued", description: "The item has been added to your digital archive." });
            setProductForm(INITIAL_FORM_STATE);
        } catch (error) {
            toast({ title: "Archival Failed", variant: "destructive" });
        }
    };

    const handleDelete = async () => {
        try {
            const isStyleCode = deleteInput.includes("-") || deleteInput.length > 8;
            await deleteProduct.mutateAsync(isStyleCode ? { styleCode: deleteInput } : { name: deleteInput });
            toast({ title: "Archival Purged", description: "Product removed successfully." });
            setDeleteInput("");
        } catch (error) {
            toast({ title: "Purge Failed", variant: "destructive" });
        }
    };

    const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = event.target?.result;
                const workbook = XLSX.read(data, { type: "binary" });
                const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
                let successCount = 0;
                for (const row of rows as any[]) {
                    const product: any = { metadata: {} };
                    for (const [header, value] of Object.entries(row)) {
                        const key = EXCEL_MAPPING[header];
                        if (!key) continue;
                        if (["name", "category", "imageUrl", "style", "color", "material"].includes(key)) {
                            product[key] = String(value);
                        } else {
                            product.metadata[key] = String(value);
                        }
                    }
                    product.name = product.name || "Untitled Silhouette";
                    product.category = product.category || "Unclassified";
                    product.price = row["Price"] ? parseInt(row["Price"]) * 100 : 0;
                    product.imageUrl = product.imageUrl || "https://images.unsplash.com/photo-1594932224010-75f430ca0489?w=600&q=80";
                    await createProduct.mutateAsync(product);
                    successCount++;
                }
                toast({ title: "Bulk Curation Complete", description: `Archived ${successCount} silhouettes.` });
            } catch (error) {
                toast({ title: "Bulk Curation Failed", variant: "destructive" });
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex">
            <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />

            <main className="flex-1 ml-80 min-h-screen">
                <header className="h-20 border-b border-black/5 bg-white flex items-center justify-between px-12 sticky top-0 z-40">
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                        <span>Current View</span>
                        <span className="text-black/10">/</span>
                        <span className="text-primary italic">Catalogue New Silhouette</span>
                    </div>

                    <div className="flex items-center gap-12">
                        {/* Navigation Links in place of Search */}
                        <div className="hidden md:flex items-center gap-8 font-body">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "text-[10px] font-bold tracking-[0.2em] uppercase transition-all pb-1 border-b-2",
                                        pathname === item.href
                                            ? "text-primary border-primary"
                                            : "text-muted-foreground/40 border-transparent hover:text-primary"
                                    )}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 border-l border-black/5 pl-8">
                            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors relative">
                                <Bell className="w-5 h-5 text-muted-foreground/60" />
                                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                            </button>
                            <button className="w-10 h-10 rounded-full overflow-hidden border border-black/5">
                                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80" className="w-full h-full object-cover" />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-12 space-y-12 max-w-[1400px] mx-auto">
                    <div id="single" className={cn(
                        "flex items-end justify-between border-b border-black/5 pb-12 transition-all p-4 rounded-3xl",
                        highlightedTab === "single" ? "section-highlight" : ""
                    )}>
                        <div className="space-y-4">
                            <h2 className="font-display text-6xl italic font-bold tracking-tight">New Silhouette</h2>
                            <p className="text-lg text-muted-foreground/60 font-body">Define individual garment metadata with artisanal precision.</p>
                        </div>
                        <Button
                            onClick={handleProductSubmit}
                            className="bg-primary hover:bg-primary/90 text-white h-14 px-8 rounded-2xl font-bold uppercase tracking-widest text-[10px] gap-3 shadow-raised transition-all"
                            disabled={createProduct.isPending}
                        >
                            {createProduct.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Catalogue Silhouette
                        </Button>
                    </div>

                    <form onSubmit={handleProductSubmit} className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {FORM_GROUPS.map((group) => (
                                <Card key={group.title} className={cn(
                                    "bg-white rounded-[2rem] shadow-ambient border-none overflow-hidden",
                                    group.title === "Asset" ? "md:col-span-2" : ""
                                )}>
                                    <div className="p-8 space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center">
                                                <group.icon className="w-5 h-5 text-primary" />
                                            </div>
                                            <h3 className="font-display text-2xl italic font-bold">{group.title}</h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {group.fields.map((field) => (
                                                <div key={field.key} className="space-y-2">
                                                    <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">{field.label}</Label>
                                                    {field.key === "imageUrl" ? (
                                                        <Input
                                                            value={productForm.imageUrl}
                                                            onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })}
                                                            placeholder={field.placeholder}
                                                            className="h-10 bg-surface border-none rounded-xl px-4 text-xs font-bold"
                                                        />
                                                    ) : (
                                                        <Input
                                                            value={(productForm as any)[field.key]}
                                                            onChange={e => setProductForm({ ...productForm, [field.key]: e.target.value })}
                                                            placeholder={field.placeholder}
                                                            className="h-10 bg-surface border-none rounded-xl px-4 text-xs font-bold"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </form>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-20">
                        <div id="bulk" className={cn(
                            "p-12 bg-white rounded-[3rem] shadow-ambient space-y-12 relative group overflow-hidden transition-all",
                            highlightedTab === "bulk" ? "section-highlight" : ""
                        )}>
                            <div className="flex items-center justify-between z-10 relative">
                                <div className="space-y-2">
                                    <h3 className="font-display text-4xl italic font-bold">Bulk Upload</h3>
                                    <p className="text-sm text-muted-foreground/60 italic">Import systemic catalog data</p>
                                </div>
                                <Upload className="w-8 h-8 text-primary/40" />
                            </div>

                            <div className="aspect-video bg-surface-container-low rounded-[2.5rem] border-2 border-dashed border-black/5 flex flex-col items-center justify-center p-12 text-center relative hover:bg-surface-container-high transition-colors">
                                <FileSpreadsheet className="w-10 h-10 text-primary mb-6 animate-pulse" />
                                <p className="text-sm font-bold mb-2">Drop Excel or CSV here</p>
                                <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-tight">Maximum file size 25MB</p>
                                <input
                                    type="file"
                                    onChange={handleExcelUpload}
                                    ref={fileInputRef}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center justify-between z-10 relative">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center">
                                        <FileSpreadsheet className="w-4 h-4 text-muted-foreground/40" />
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-tight">Recent: catalog_update_v2.csv</span>
                                </div>
                                <button className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                                    Bulk Archival
                                </button>
                            </div>
                        </div>

                        <div id="manage" className={cn(
                            "p-12 bg-white rounded-[3rem] shadow-ambient space-y-12 relative overflow-hidden transition-all",
                            highlightedTab === "manage" ? "section-highlight" : ""
                        )}>
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <h3 className="font-display text-4xl italic font-bold">Manage Catalog</h3>
                                    <p className="text-sm text-muted-foreground/60 italic">Refine and prune the collection</p>
                                </div>
                                <Trash2 className="w-8 h-8 text-red-500/40" />
                            </div>

                            <div className="bg-surface-container-low rounded-[2.5rem] p-2 flex items-center gap-2">
                                <input
                                    value={deleteInput}
                                    onChange={e => setDeleteInput(e.target.value)}
                                    placeholder="Remove by Name or Style Code..."
                                    className="flex-1 bg-transparent h-12 px-6 text-sm font-body outline-none"
                                />
                                <Button
                                    onClick={handleDelete}
                                    disabled={!deleteInput || deleteProduct.isPending}
                                    className="bg-white hover:bg-red-50 text-red-500 h-10 px-6 rounded-2xl font-bold uppercase tracking-widest text-[9px] shadow-sm transition-all"
                                >
                                    Find & Remove
                                </Button>
                            </div>

                            <div className="p-6 bg-red-50/50 rounded-3xl flex gap-4 border border-red-100/20">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                </div>
                                <p className="text-[11px] leading-relaxed text-muted-foreground/70">
                                    <span className="font-bold text-red-600 block mb-1">Warning:</span>
                                    Deletion is permanent and will remove all associated media and metadata from the production server.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 px-2">Marked for Review (2)</p>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-4 bg-surface rounded-2xl hover:bg-surface-container-low transition-colors group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-black/5">
                                                <ImageIcon className="w-4 h-4 text-muted-foreground/20" />
                                            </div>
                                            <span className="text-xs font-bold text-muted-foreground/60">MM-23-ACC-14 (Obsolete)</span>
                                        </div>
                                        <Trash2 className="w-4 h-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-surface rounded-2xl hover:bg-surface-container-low transition-colors group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-black/5">
                                                <ImageIcon className="w-4 h-4 text-muted-foreground/20" />
                                            </div>
                                            <span className="text-xs font-bold text-muted-foreground/60">Summer Kaftan Pink (Duplicate)</span>
                                        </div>
                                        <Trash2 className="w-4 h-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="mt-20 px-12 py-8 border-t border-black/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        System Live: All Catalogs Synchronized
                    </div>
                    <div className="flex gap-8">
                        <button className="hover:text-primary transition-colors">Documentation</button>
                        <button className="hover:text-primary transition-colors">API Status</button>
                        <button className="hover:text-primary transition-colors">Editorial Guidelines</button>
                    </div>
                </footer>
            </main>
        </div>
    );
}
