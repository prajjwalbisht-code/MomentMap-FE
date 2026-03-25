"use client";

import { LayoutDashboard, UserPlus, UploadCloud, Trash2, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const MENU_ITEMS = [
    { label: "Single Entry", icon: UserPlus, id: "single" },
    { label: "Bulk Upload", icon: UploadCloud, id: "bulk" },
    { label: "Manage Catalog", icon: Trash2, id: "manage" },
];

interface AdminSidebarProps {
    activeTab: string;
    onTabChange: (id: string) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
    return (
        <aside className="fixed left-0 top-0 h-screen w-80 bg-white shadow-ambient z-50 flex flex-col p-8 border-r border-black/5">
            <div className="mb-16">
                <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
                    MomentMap
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40 mt-1">
                    Editorial Admin
                </p>
            </div>

            <nav className="flex-1 space-y-4">
                {MENU_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={cn(
                            "w-full flex items-center gap-4 px-6 py-4 rounded-full transition-all duration-300 group relative",
                            activeTab === item.id
                                ? "bg-primary text-white shadow-raised"
                                : "text-muted-foreground/60 hover:bg-surface-container-low"
                        )}
                    >
                        <item.icon className={cn(
                            "w-5 h-5 transition-transform duration-300",
                            activeTab === item.id ? "scale-110" : "group-hover:scale-110"
                        )} />
                        <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>

                        {activeTab === item.id && (
                            <motion.div
                                layoutId="sidebar-active"
                                className="absolute -right-2 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary rounded-full"
                            />
                        )}
                    </button>
                ))}
            </nav>

            <div className="mt-auto space-y-8">
                <div className="flex items-center gap-4 p-4 rounded-3xl bg-surface-container-low border border-black/5">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                        <img
                            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80"
                            alt="Elena Vance"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <p className="text-sm font-bold">Elena Vance</p>
                        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tight">Head Curator</p>
                    </div>
                </div>

                <div className="flex items-center justify-between px-4">
                    <button className="text-muted-foreground/40 hover:text-foreground transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                    <button className="text-muted-foreground/40 hover:text-red-500 transition-colors">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
