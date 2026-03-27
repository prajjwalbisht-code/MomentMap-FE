"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { EventDialog } from "@/components/event/EventDialog";
import { useEvents } from "@/hooks/use-events";
import { format, startOfMonth, endOfMonth, isSameDay, getDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Sparkles, Plus, ArrowRight, Bell, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Event } from "@shared/schema";
import Link from "next/link";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function getDaysInMonth(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: (Date | null)[] = [];

  // Padding for the first week
  for (let i = 0; i < getDay(firstDay); i++) days.push(null);

  // Actual days
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));

  // Padding for the last week
  while (days.length % 7 !== 0) days.push(null);

  return days;
}

const PILL_COLORS = [
  "bg-[#FFE4E9] text-[#B4136D]", // Light Pink
  "bg-[#EAE4FF] text-[#630ED4]", // Light Purple
  "bg-[#630ED4] text-white",     // Deep Purple
  "bg-[#B4136D] text-white",     // Deep Pink
  "bg-[#FF4081] text-white",     // Vivid Pink
];

function getPillColor(eventName: string) {
  const name = eventName.toLowerCase();

  // Specific keyword matching for precision
  if (name.includes("review") || name.includes("drop")) return PILL_COLORS[0];
  if (name.includes("karaga") || name.includes("launch")) return PILL_COLORS[1];
  if (name.includes("runway") || name.includes("prep")) return PILL_COLORS[2];
  if (name.includes("mario")) return PILL_COLORS[3];
  if (name.includes("movie")) return PILL_COLORS[4];

  // Hash-based fallback for all other events to ensure they ARE colored
  let hash = 0;
  for (let i = 0; i < eventName.length; i++) {
    hash = eventName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PILL_COLORS[Math.abs(hash) % PILL_COLORS.length];
}

export default function CalendarPage() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const monthStart = startOfMonth(new Date(viewYear, viewMonth));
  const monthEnd = endOfMonth(new Date(viewYear, viewMonth));

  const monthStr = format(new Date(viewYear, viewMonth), "yyyy-MM");
  const { data: eventsMap = {} } = useEvents(monthStr);

  const eventsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    Object.entries(eventsMap || {}).forEach(([day, value]: [string, any]) => {
      if (value.events) {
        const dayStr = day.padStart(2, '0');
        const dateStr = `${monthStr}-${dayStr}`;
        map[dateStr] = value.events.map((e: any) => ({
          ...e,
          name: e.title || e.name, // Support both for transition
          date: dateStr // Ensure it matches the YYYY-MM-DD expected by calendar
        }));
      }
    });
    return map;
  }, [eventsMap, monthStr]);

  const calendarDays = useMemo(
    () => getDaysInMonth(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const setTodayAction = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const evts = eventsByDate[dateStr] ?? [];
    if (evts.length === 0) return;
    setSelectedDate(dateStr);
    setSelectedEvents(evts as Event[]);
    setIsDialogOpen(true);
  };

  const todayImageUrl = "https://cdn.shopify.com/s/files/1/0813/2267/2439/files/Snapinsta.app_433465435_757875729623761_3870725218213777141_n_1080_480x480.jpg?v=1711505777";
  const highlightImageUrl = "https://cdn.mos.cms.futurecdn.net/whowhatwear/posts/282134/fashion-trends-miranda-priestly-hates-the-devil-wears-prada-282134-1566952533218-image.jpg";

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <Navbar />

      <main className="container mx-auto px-8 py-12 max-w-[1500px]">
        {/* Header Section */}
        <section className="mb-16">
          <div className="flex justify-between items-end">
            <div>
              <span className="font-body text-[11px] font-bold tracking-[0.4em] text-primary mb-4 block uppercase opacity-80">
                The Digital Curator
              </span>
              <h1 className="text-[7rem] xl:text-[10rem] font-display font-bold leading-[0.85] tracking-tight">
                {format(new Date(viewYear, viewMonth), "MMMM")} <span className="font-light italic">{viewYear}</span>
              </h1>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={prevMonth}
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-white/80 transition-all border border-black/5"
              >
                <ChevronLeft className="w-5 h-5 text-foreground/40" />
              </button>
              <button
                onClick={setTodayAction}
                className="bg-primary text-white px-10 py-3 rounded-full font-body font-bold text-sm tracking-widest uppercase shadow-raised"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-white/80 transition-all border border-black/5"
              >
                <ChevronRight className="w-5 h-5 text-foreground/40" />
              </button>
            </div>
          </div>
        </section>

        {/* Calendar Grid Section */}
        <div className="relative mb-24">
          <div className="bg-white/40 rounded-[3rem] p-10 shadow-ambient overflow-hidden backdrop-blur-sm">
            <div className="grid grid-cols-7 mb-10">
              {WEEKDAYS.map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-muted-foreground/30 tracking-[0.4em] uppercase">
                  {d}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${viewYear}-${viewMonth}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-7"
              >
                {calendarDays.map((date, idx) => {
                  if (!date) return (
                    <div key={`empty-${idx}`} className="min-h-[220px] bg-transparent" />
                  );

                  const dateStr = format(date, "yyyy-MM-dd");
                  const dayEvents = eventsByDate[dateStr] ?? [];
                  const isSelectedMonth = date.getMonth() === viewMonth;
                  const isCurrentDay = isToday(date);

                  return (
                    <div
                      key={dateStr}
                      onClick={() => handleDayClick(date)}
                      className={`
                            group relative min-h-[220px] p-6 flex flex-col items-start justify-start transition-all duration-300
                            ${!isSelectedMonth ? "opacity-10 translate-y-2 pointer-events-none" : "hover:bg-white/60 cursor-pointer"}
                            `}
                    >
                      {/* Background image for current day */}
                      {isCurrentDay && (
                        <div className="absolute inset-0 z-0">
                          <img
                            src={todayImageUrl}
                            alt="Current Day"
                            className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-white/10" />
                        </div>
                      )}

                      <div className={`
                            relative z-10 w-12 h-12 flex items-center justify-start text-[2.5rem] font-display font-light italic mb-2 tracking-tighter
                            ${isCurrentDay ? "text-primary font-bold" : "text-foreground/20 group-hover:text-foreground/40"}
                            `}>
                        {date.getDate().toString().padStart(2, '0')}
                      </div>

                      {dayEvents.length > 0 && (
                        <div className="relative z-10 w-full space-y-2 mt-4">
                          {dayEvents.slice(0, 2).map((e, eIdx) => (
                            <div key={eIdx} className="w-full">
                              <div
                                className={`
                                        px-4 py-1.5 rounded-full text-[9px] font-bold tracking-tight w-fit max-w-full truncate shadow-sm
                                        ${getPillColor(e.name)}
                                        `}
                              >
                                {e.name.toUpperCase()}
                              </div>
                            </div>
                          ))}

                          {dayEvents.length > 2 && (
                            <div className="absolute bottom-[-10px] right-2 flex items-center justify-center">
                              <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shadow-sm backdrop-blur-md">
                                +{dayEvents.length - 2}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Floating Action Button */}
          <button className="absolute -bottom-8 -right-4 w-16 h-16 rounded-full bg-[#B4136D] text-white flex items-center justify-center shadow-raised hover:scale-110 transition-all z-20">
            <Plus className="w-8 h-8" />
          </button>
        </div>

        {/* Highlight Section */}
        <section className="mb-24">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              <div className="bg-white rounded-[4rem] p-16 shadow-ambient flex flex-col justify-center h-full">
                <span className="font-body text-[10px] font-bold tracking-[0.4em] text-[#B4136D] mb-8 block uppercase opacity-80">
                  Curated Highlight
                </span>
                <h2 className="text-[5rem] font-display font-bold leading-[1] tracking-tight mb-8">
                  Spring Trend: <br />
                  <span className="italic font-light">Translucent Silhouettes</span>
                </h2>
                <p className="font-body text-xl text-muted-foreground max-w-xl leading-relaxed mb-12">
                  This month, we explore the intersection of digital transparency and physical textures.
                  A curated selection for the avant-garde wardrobe.
                </p>
                <Link
                  href="/products"
                  className="flex items-center gap-4 font-body font-bold text-sm tracking-[0.2em] uppercase text-primary hover:gap-6 transition-all"
                >
                  View Editorial <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-[4rem] overflow-hidden shadow-ambient h-full aspect-square lg:aspect-auto relative group">
                <img
                  src={highlightImageUrl}
                  alt="Editorial"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute bottom-10 left-10 text-white z-10">
                  <span className="text-[10px] font-bold tracking-widest uppercase opacity-60 mb-2 block">Latest Collection</span>
                  <h3 className="font-display text-4xl font-bold tracking-tight">The <span className="italic font-light">Noir Series</span></h3>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-12 pb-24 border-t border-black/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="font-display text-2xl font-bold tracking-tight">
              <span className="italic font-light text-primary">Moment</span>Map
            </div>

            <div className="flex gap-12 text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/60">
              <Link href="#" className="hover:text-primary transition-colors">Instagram</Link>
              <Link href="#" className="hover:text-primary transition-colors">Pinterest</Link>
              <Link href="#" className="hover:text-primary transition-colors">Newsletter</Link>
              <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            </div>

            <div className="text-[10px] font-body tracking-[0.1em] text-muted-foreground/30 uppercase">
              © 2024 MomentMap. The Digital Curator.
            </div>
          </div>
        </footer>
      </main>

      <EventDialog
        dateStr={selectedDate}
        events={selectedEvents}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
