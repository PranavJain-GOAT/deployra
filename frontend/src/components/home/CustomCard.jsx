import { Link } from "react-router-dom";
import { ArrowUpRight, Clock, Star, MessageSquare, Play } from "lucide-react";
import { motion } from "framer-motion";

const SOLUTION_IMAGES = {
  chatbot: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
  automation: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
  website: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80",
  analytics: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80",
  marketing: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&q=80",
  other: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&q=80",
};

export default function CustomCard({ solution, index }) {
  const demoUrl = solution.demoUrl || solution.demo_url;
  const deliveryDays = solution.deliveryDays || solution.delivery_days || 5;
  const developerName = solution.developer?.name || solution.developer_name || "AlphaDev";
  const rating = solution.rating || 0;
  const installsCount = solution.salesCount || solution.installs_count || 0;
  const plainEnglish = solution.whatItDoes || solution.plain_english;
  const priceMin = solution.price || solution.price_min || 0;
  const priceMax = solution.price || solution.price_max || 0;
  const imageUrl = (solution.images && solution.images.length > 0 ? solution.images[0] : null) || solution.image_url;
  const img = imageUrl || SOLUTION_IMAGES[solution.category] || SOLUTION_IMAGES.other;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 17,
        delay: Math.min(index, 6) * 0.05
      }}
      className="h-full"
    >
      <div className="group rounded-2xl overflow-hidden flex flex-col h-full border border-white/8 bg-white/3 hover:border-white/16 transition-all duration-300">

        {/* ── Image with LIVE DEMO overlay ── */}
        <div className="relative overflow-hidden h-48 shrink-0">
          <img
            src={img}
            alt={solution.title}
            className="w-full h-full object-cover opacity-75 group-hover:scale-105 group-hover:opacity-60 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Play overlay on hover */}
          {demoUrl && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]"
            >
              <div className="w-12 h-12 rounded-full border border-white/30 bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </div>
            </a>
          )}

          {/* LIVE DEMO label top-left on hover */}
          {demoUrl && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-white/15 backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-mono text-white font-semibold tracking-wider">LIVE DEMO</span>
              <ArrowUpRight className="w-3 h-3 text-white/70" />
            </a>
          )}

          {/* Normal badges (hidden on hover) */}
          <div className="absolute top-3 left-3 flex gap-1.5 group-hover:opacity-0 transition-opacity duration-200">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/50 text-white/70 border border-white/10 backdrop-blur-sm">
              CUSTOM
            </span>
            {solution.category && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/50 text-white/70 border border-white/10 backdrop-blur-sm">
                {solution.category.toUpperCase()}
              </span>
            )}
          </div>

          {/* Delivery time top-right */}
          {deliveryDays && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/50 text-white/70 border border-white/10 backdrop-blur-sm flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {deliveryDays}d delivery
              </span>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-semibold text-white/70">{rating.toFixed(1)}</span>
              <span className="text-[10px] font-mono text-white/25">({installsCount} orders)</span>
            </div>
            {developerName && (
              <span className="text-[10px] font-mono text-white/25">by {developerName}</span>
            )}
          </div>

          <h3
            className="text-white font-bold text-base leading-snug mb-2"
            style={{ letterSpacing: "-0.03em", fontFamily: "Georgia, serif" }}
          >
            {solution.title}
          </h3>

          {/* Plain English box */}
          {plainEnglish && (
            <div className="flex gap-2 mb-3 p-3 rounded-xl bg-white/5 border border-white/8">
              <MessageSquare className="w-3.5 h-3.5 text-white/30 shrink-0 mt-0.5" />
              <p className="text-white/55 text-xs leading-relaxed" style={{ letterSpacing: "-0.01em" }}>
                {plainEnglish}
              </p>
            </div>
          )}

          <p className="text-white/35 text-xs leading-relaxed mb-4 line-clamp-2 font-mono">
            {solution.description}
          </p>

          {/* Bottom: price + View only */}
          <div className="flex items-center justify-between mt-auto">
            <div className="text-white font-bold text-base" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
              ${priceMin}
              {priceMin !== priceMax && (
                <span className="text-white/30 text-xs font-mono font-normal ml-0.5">–${priceMax}</span>
              )}
            </div>
            <Link to={`/product/${solution.id}`}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-8 px-4 rounded-full bg-white text-black text-xs font-bold flex items-center gap-1.5 hover:bg-white/90 transition-all"
              >
                View <ArrowUpRight className="w-3.5 h-3.5" />
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}