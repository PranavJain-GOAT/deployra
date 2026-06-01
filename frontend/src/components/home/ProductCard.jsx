import { Link } from "react-router-dom";
import { ArrowUpRight, Zap, Star, MessageSquare, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const CATEGORY_IMAGES = {
  chatbot: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80",
  automation: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
  website: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80",
  analytics: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  marketing: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
  other: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&q=80",
};

export default function ProductCard({ product, index, featured = false }) {
  const [imgError, setImgError] = useState(false);
  
  const demoUrl = product.demoUrl || product.demo_url;
  const setupTime = product.setupTime || product.setup_time;
  const plainEnglish = product.whatItDoes || product.plain_english;
  const imageUrl = (product.images && product.images.length > 0 ? product.images[0] : null) || product.image_url;
  const rating = product.rating || 0;
  const reviewsCount = product.reviewCount || product.reviews_count || 0;
  const installsCount = product.salesCount || product.installs_count || 0;
  const img = imageUrl || CATEGORY_IMAGES[product.category] || CATEGORY_IMAGES.other;

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
      <div className={`group rounded-2xl overflow-hidden flex h-full border border-white/8 bg-white/3 hover:border-white/16 transition-all duration-300 ${featured ? "flex-row min-h-[280px]" : "flex-col"}`}>

        {/* ── Image with LIVE DEMO hover overlay ── */}
        <div className={`relative overflow-hidden shrink-0 ${featured ? "w-2/5" : "h-48"}`}>
          {imgError ? (
            <div className="w-full h-full flex items-center justify-center bg-white/4">
              <Zap className="w-8 h-8 text-white/15" />
            </div>
          ) : (
            <img
              src={img}
              alt={product.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover opacity-75 group-hover:scale-105 group-hover:opacity-60 transition-all duration-500"
            />
          )}

          {/* Dark overlay always */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* LIVE DEMO hover overlay */}
          {demoUrl && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Play button */}
              <div className="w-12 h-12 rounded-full border border-white/30 bg-white/10 flex items-center justify-center backdrop-blur-sm mb-0">
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </div>
            </a>
          )}

          {/* Top-left: LIVE DEMO label (always visible on hover) */}
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

          {/* Top badges (hidden on hover, shown normally) */}
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap group-hover:opacity-0 transition-opacity duration-200">
            {product.badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-black">
                {product.badge}
              </span>
            )}
            {product.category && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/50 text-white/70 border border-white/10 backdrop-blur-sm">
                {product.category.toUpperCase()}
              </span>
            )}
          </div>

          {/* Setup time — top right */}
          {setupTime && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/50 text-white/70 border border-white/10 backdrop-blur-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                {setupTime}
              </span>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="p-5 flex flex-col flex-1">
          {/* Rating row */}
          <div className="flex items-center gap-1.5 mb-3">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-semibold text-white/70">{rating.toFixed(1)}</span>
            <span className="text-[10px] font-mono text-white/25">({reviewsCount} reviews)</span>
            <span className="text-[10px] font-mono text-white/25 ml-auto">
              {installsCount >= 1000
                ? `${(installsCount / 1000).toFixed(1)}k`
                : installsCount} installs
            </span>
          </div>

          <h3
            className="text-white font-bold text-base leading-snug mb-2"
            style={{ letterSpacing: "-0.03em", fontFamily: "Georgia, serif" }}
          >
            {product.title}
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
            {product.description}
          </p>

          {/* Bottom row: price + View only */}
          <div className="flex items-center justify-between mt-auto">
            <div className="text-white font-bold text-lg" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
              ${product.price}
              <span className="text-white/30 text-xs font-normal ml-1 font-mono">one-time</span>
            </div>
            <Link to={`/product/${product.id}`}>
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