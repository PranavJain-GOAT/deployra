import { useState, useEffect } from "react";
import { MOCK_PRODUCTS } from "@/api/mockData";
import { Link } from "react-router-dom";
import { Edit, Trash2, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Listings() {
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data locally
    setTimeout(() => {
      setSolutions(MOCK_PRODUCTS);
      setLoading(false);
    }, 400);
  }, []);

  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    setSolutions((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl">
      <div className="mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold">My Listings</h1>
          <p className="text-muted-foreground text-sm mt-1">{solutions.length} products listed</p>
      </div>

      {solutions.length === 0 ? (
        <div className="bg-card border-2 border-border rounded-2xl p-16 text-center">
          <p className="font-heading font-semibold text-lg mb-2">No products yet</p>
          <p className="text-muted-foreground text-sm mb-6">List your first product to start earning</p>
          <Link to="/developer/add">
            <Button className="bg-foreground text-background font-heading font-bold rounded-xl gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Product
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {solutions.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border-2 border-border rounded-2xl p-5 flex items-center justify-between hover:border-foreground/30 transition-all"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center shrink-0">
                  <span className="font-heading font-bold text-lg">{s.title?.[0] || "?"}</span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-bold text-sm truncate">{s.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">{s.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-bold">${s.price_min}–${s.price_max}</span>
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${s.status === "active" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                      }`}>
                      {s.status || "pending"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Link to={`/custom/${s.id}`}>
                  <Button variant="ghost" size="icon" className="rounded-xl"><Eye className="w-4 h-4" /></Button>
                </Link>
                <Link to={`/developer/edit/${s.id}`}>
                  <Button variant="ghost" size="icon" className="rounded-xl"><Edit className="w-4 h-4" /></Button>
                </Link>
                <Button variant="ghost" size="icon" className="rounded-xl text-destructive" onClick={() => handleDelete(s.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}