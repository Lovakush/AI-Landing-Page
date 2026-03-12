'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Package, Sparkles, ChevronRight, Check, ArrowRight, Layers, Zap, BookMarked, Trash2, Clock } from "lucide-react";

// ─── Bundle Catalogue Data ───
const bundleCatalogue: Record<string, { name: string; agents: string[]; rationale: string; highlight: boolean }[]> = {
  "Finance": [
    { name: "AP Essentials", agents: ["Invoice Intake", "Invoice Processing", "Parked & Blocked Invoices"], rationale: "Entry-level AP automation covering the core invoice lifecycle; fast time-to-value.", highlight: false },
    { name: "AP Full Suite", agents: ["Invoice Intake", "Non-PO Invoices", "Baseline Date Optimizer", "Payments Optimizer", "Duplicate Invoices", "Currency Optimizer", "Credit Memos", "Invoice Processing", "Parked & Blocked Invoices"], rationale: "End-to-end AP control tower.", highlight: true },
    { name: "AR Essentials", agents: ["Collections Acceleration", "Billing Blocks", "Intelligent Credit Limits", "Compliance & Fraud"], rationale: "Accelerates inflows while blocking bad credit and fraud exposure.", highlight: false },
    { name: "AR Full Suite", agents: ["Collections Acceleration", "Payment Term Optimization", "Dispute & Claims Management", "Unearned Discounts", "Billing Blocks", "Intelligent Credit Limits", "Compliance & Fraud"], rationale: "Complete AR control tower covering disputes, discounts, payment terms, and collections.", highlight: true },
  ],
  "Supply Chain": [
    { name: "Procurement Essentials", agents: ["Smart Sourcing Planner", "Tender Orchestrator", "Spend Optimization"], rationale: "Covers sourcing intelligence and spend visibility. Basic Package for procurement.", highlight: true },
    { name: "Procurement Integrity Pack", agents: ["Fraud Detection", "Contract Leakage", "Requisition Management"], rationale: "Addresses the compliance and leakage side of procurement.", highlight: true },
    { name: "Full Procurement Suite", agents: ["Smart Sourcing Planner", "Tender Orchestrator", "PO & Change Control", "Fraud Detection", "Contract Leakage", "Category Management", "Requisition Management", "Spend Optimization"], rationale: "Complete source-to-PO automation. Covers strategic sourcing, category management, compliance, and fraud in one bundle.", highlight: true },
    { name: "Logistics Control Tower", agents: ["Plan Adherence", "Plan Execution", "Transportation Optimizer", "Exception Handler", "Reverse Logistics", "Carrier Performance", "Disruption Response", "Shipment Visibility"], rationale: "Full logistics solution.", highlight: true },
    { name: "Plant Maintenance Suite", agents: ["Machinery Performance", "Asset Maintenance Notification", "Spare-Part Duplication"], rationale: "Complete plant maintenance solution.", highlight: true },
  ],
  "Front Office": [
    { name: "Customer Service Starter Kit", agents: ["Customer Inquiry Intake", "Non-Ticket Requests", "Service Optimizer"], rationale: "Automates the most repetitive customer service interactions.", highlight: true },
    { name: "Customer Resolution Suite", agents: ["Escalated & Pending Tickets", "Refunds & Adjustments", "Response Date Optimizer", "Customer Interaction Processing"], rationale: "Focuses on resolution quality and SLA compliance.", highlight: true },
  ],
};

const categoryColors: Record<string, { color: string; gradient: string }> = {
  Finance: { color: "#E8B84A", gradient: "linear-gradient(135deg, #E8B84A, #E8A87C)" },
  "Supply Chain": { color: "#06B6D4", gradient: "linear-gradient(135deg, #06B6D4, #22D3EE)" },
  "Front Office": { color: "#A855F7", gradient: "linear-gradient(135deg, #A855F7, #C084FC)" },
};

type Bundle = { name: string; agents: string[]; rationale: string; highlight: boolean };
type SavedBundle = { id: string; bundleName: string; agents: string[]; createdAt: string; source: "catalogue" | "custom" };

// ─── Bundle Card ───
function BundleCard({ bundle, categoryColor, onAdd }: { bundle: Bundle; categoryColor: string; onAdd: (b: Bundle) => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div layout className="relative rounded-xl overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${categoryColor}15, ${categoryColor}06)`, border: `1px solid ${categoryColor}45`, boxShadow: `0 0 20px ${categoryColor}18` }}>
      <div className="p-4">
        <h4 className="text-white font-semibold text-sm leading-snug mb-1.5 pr-16">{bundle.name}</h4>
        <p className="text-white/40 text-xs leading-relaxed mb-3">{bundle.rationale}</p>
        <div className="flex items-center justify-between">
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs font-medium" style={{ color: categoryColor }}>
            <span>{bundle.agents.length} agents</span>
            <motion.span animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}><ChevronRight className="w-3 h-3" /></motion.span>
          </button>
          <motion.button onClick={() => onAdd(bundle)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
            style={{ background: `${categoryColor}18`, border: `1px solid ${categoryColor}35`, color: categoryColor }}
            whileHover={{ background: `${categoryColor}30` }} whileTap={{ scale: 0.96 }}>
            <Plus className="w-3 h-3" /> Add
          </motion.button>
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="flex flex-wrap gap-1 pt-3 mt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {bundle.agents.map((agent, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded-full text-xs" style={{ background: `${categoryColor}12`, color: categoryColor, border: `1px solid ${categoryColor}25` }}>{agent}</span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Custom Bundle Builder ───
function CustomBundleBuilder({ onClose, onSave }: { onClose: () => void; onSave: (agents: string[]) => void }) {
  const allAgents = [
    "Invoice Intake", "Invoice Processing", "Parked & Blocked Invoices", "Non-PO Invoices",
    "Baseline Date Optimizer", "Payments Optimizer", "Duplicate Invoices", "Currency Optimizer",
    "Credit Memos", "Collections Acceleration", "Payment Term Optimization", "Dispute & Claims Management",
    "Unearned Discounts", "Billing Blocks", "Intelligent Credit Limits", "Compliance & Fraud",
    "Financial Closing", "Reconciliation & Settlement", "Audit & Control", "Tax & Compliance",
    "Transfer Pricing", "Smart Sourcing Planner", "Tender Orchestrator", "Spend Optimization",
    "Fraud Detection", "Contract Leakage", "Requisition Management", "PO & Change Control",
    "Category Management", "Order Intake", "Lead Time Enforcement", "Predictive OTIF",
    "Order Compliance", "Shipment Visibility", "Stuck Orders", "Order Block Resolver",
    "Returns & Disputes", "Unbilled Tracker", "Customer Consignment", "Load Consolidation",
    "Carrier Performance", "Route Optimization", "Reverse Logistics", "Plan Adherence",
    "Plan Execution", "Exception Handler", "Disruption Response", "Inventory Allocation",
    "Replenishment Optimization", "Proactive Material Planning", "Obsolete Stock Handler",
    "Customer Inquiry Intake", "Non-Ticket Requests", "Service Optimizer", "Escalated & Pending Tickets",
    "Refunds & Adjustments", "Response Date Optimizer", "Customer Interaction Processing",
    "Proactive Optimization", "Problem & Change Validator", "Ticket Sentiment Monitor",
    "Operations Intelligence", "Workload Balancer", "Demand Analyzer", "Win Rate Optimization",
    "Tactical Pricing", "Dynamic Price Setting", "Machinery Performance", "Asset Maintenance Notification",
  ];
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const filtered = allAgents.filter((a) => a.toLowerCase().includes(search.toLowerCase()));
  const toggle = (agent: string) => setSelected((prev) => prev.includes(agent) ? prev.filter((a) => a !== agent) : [...prev, agent]);

  if (submitted) {
    return (
      <motion.div className="flex flex-col items-center justify-center py-16 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <motion.div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
          style={{ background: "rgba(232,184,74,0.15)", border: "2px solid rgba(232,184,74,0.5)" }}
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
          <Check className="w-8 h-8" style={{ color: "#E8B84A" }} />
        </motion.div>
        <h3 className="text-xl font-bold text-white mb-2">Bundle Saved!</h3>
        <p className="text-white/50 text-sm max-w-xs">Your custom bundle with <span style={{ color: "#E8B84A" }}>{selected.length} agents</span> has been noted. Our team will reach out to discuss pricing.</p>
        <button onClick={onClose} className="mt-6 px-6 py-2.5 rounded-xl font-semibold text-black text-sm" style={{ background: "linear-gradient(135deg, #E8B84A, #E8A87C)" }}>Done</button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <input type="text" placeholder="Search agents..." value={search} onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-white text-sm outline-none mb-3"
        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }} />
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: "300px" }}>
        <div className="flex flex-wrap gap-2">
          {filtered.map((agent) => {
            const isSel = selected.includes(agent);
            return (
              <motion.button key={agent} onClick={() => toggle(agent)} className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                style={{ background: isSel ? "rgba(232,184,74,0.22)" : "rgba(255,255,255,0.05)", border: isSel ? "1px solid rgba(232,184,74,0.55)" : "1px solid rgba(255,255,255,0.09)", color: isSel ? "#E8B84A" : "rgba(255,255,255,0.55)" }}
                whileTap={{ scale: 0.96 }}>
                {isSel && <Check className="w-2.5 h-2.5 inline mr-1" />}{agent}
              </motion.button>
            );
          })}
        </div>
      </div>
      {selected.length > 0 && (
        <motion.div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/50 text-xs">{selected.length} agents selected</span>
            <button onClick={() => setSelected([])} className="text-xs text-white/25 hover:text-white/50 transition-colors">Clear all</button>
          </div>
          <motion.button onClick={() => { onSave(selected); setSubmitted(true); }}
            className="w-full py-2.5 rounded-xl font-bold text-black text-sm"
            style={{ background: "linear-gradient(135deg, #E8B84A, #E8A87C)" }}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            Build My Bundle →
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Bundle Overlay Modal ───
function BundleOverlay({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"examples" | "custom" | "saved">("examples");
  const [activeCategory, setActiveCategory] = useState("Finance");
  const [myBundle, setMyBundle] = useState<Bundle[]>([]);
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [savedBundles, setSavedBundles] = useState<SavedBundle[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showMobilePanel, setShowMobilePanel] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    try { const stored = localStorage.getItem("savedBundles"); if (stored) setSavedBundles(JSON.parse(stored)); } catch {}
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const persistSaved = (bundles: SavedBundle[]) => {
    setSavedBundles(bundles);
    try { localStorage.setItem("savedBundles", JSON.stringify(bundles)); } catch {}
  };

  const addToBundle = (bundle: Bundle) => {
    if (!myBundle.find((b) => b.name === bundle.name)) {
      setMyBundle((prev) => [...prev, bundle]);
      setAddedFeedback(bundle.name);
      setTimeout(() => setAddedFeedback(null), 1800);
    }
  };

  const removeFromBundle = (name: string) => setMyBundle((prev) => prev.filter((b) => b.name !== name));

  const saveCurrentBundle = () => {
    if (myBundle.length === 0) return;
    const allAgents = myBundle.flatMap((b) => b.agents);
    const newSaved: SavedBundle = {
      id: Date.now().toString(),
      bundleName: myBundle.map((b) => b.name).join(" + "),
      agents: allAgents,
      createdAt: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      source: "catalogue",
    };
    persistSaved([newSaved, ...savedBundles]);
    setMyBundle([]);
    setAddedFeedback("Bundle saved!");
    setTimeout(() => { setAddedFeedback(null); setActiveTab("saved"); }, 1200);
  };

  const saveCustomBundle = (agents: string[]) => {
    const newSaved: SavedBundle = {
      id: Date.now().toString(),
      bundleName: `Custom Bundle (${agents.length} agents)`,
      agents,
      createdAt: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      source: "custom",
    };
    persistSaved([newSaved, ...savedBundles]);
    setTimeout(() => setActiveTab("saved"), 1600);
  };

  const deleteSaved = (id: string) => { persistSaved(savedBundles.filter((b) => b.id !== id)); setDeleteConfirm(null); };

  const modal = (
    <motion.div className="fixed inset-0 flex items-end sm:items-center justify-center sm:px-4" style={{ zIndex: 99999 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />

      <motion.div
        className="relative w-full sm:rounded-2xl overflow-hidden rounded-t-3xl"
        style={{
          maxWidth: "960px",
          height: "92vh",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(160deg, #0e0820 0%, #1a0d35 60%, #0c0118 100%)",
          border: "1px solid rgba(168,85,247,0.22)",
          boxShadow: "0 32px 100px rgba(0,0,0,0.85), 0 0 60px rgba(168,85,247,0.12)",
        }}
        initial={{ scale: 0.97, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.97, y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(168,85,247,0.18)", border: "1px solid rgba(168,85,247,0.35)" }}>
              <Package className="w-4 h-4" style={{ color: "#A855F7" }} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-none mb-0.5">Create Your Bundle</h2>
              <p className="text-white/50 text-xs hidden sm:block">Mix agents across categories or choose from curated packs</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile: My Bundle toggle */}
            {activeTab === "examples" && myBundle.length > 0 && (
              <motion.button
                className="sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs"
                style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}
                onClick={() => setShowMobilePanel(true)}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              >
                <Layers className="w-3 h-3" style={{ color: "#A855F7" }} />
                <span className="text-white font-semibold">{myBundle.length}</span>
              </motion.button>
            )}
            {/* Desktop: bundle count badge */}
            {myBundle.length > 0 && (
              <motion.div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <Layers className="w-3.5 h-3.5" style={{ color: "#A855F7" }} />
                <span className="text-white font-semibold">{myBundle.length}</span>
              </motion.div>
            )}
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex px-4 sm:px-6 pt-3 sm:pt-4 gap-1.5 sm:gap-2 flex-shrink-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {([
            { id: "examples", label: "Catalogue", icon: Sparkles },
            { id: "custom",   label: "Build Own",  icon: Zap },
            { id: "saved",    label: "My Bundles", icon: BookMarked },
          ] as const).map((tab) => {
            const isActive = activeTab === tab.id;
            const showCount = tab.id === "saved" && savedBundles.length > 0;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all relative flex-shrink-0"
                style={{ background: isActive ? "rgba(168,85,247,0.18)" : "rgba(255,255,255,0.05)", border: isActive ? "1px solid rgba(168,85,247,0.45)" : "1px solid rgba(255,255,255,0.07)", color: isActive ? "#C084FC" : "rgba(255,255,255,0.45)" }}>
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {showCount && (
                  <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold leading-none"
                    style={{ background: "rgba(168,85,247,0.35)", color: "#C084FC", border: "1px solid rgba(168,85,247,0.4)" }}>
                    {savedBundles.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Body ── */}
        <div style={{ display: "flex", flex: "1 1 0", minHeight: 0, overflow: "hidden" }}>
          {/* Main scroll area */}
          <div style={{ flex: "1 1 0", minHeight: 0, overflowY: "auto", padding: "16px" }} className="sm:px-6">
            {activeTab === "examples" ? (
              <>
                {/* Category sub-tabs */}
                <div className="flex gap-1.5 sm:gap-2 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {Object.keys(bundleCatalogue).map((cat) => {
                    const catColor = categoryColors[cat].color;
                    const isActive = activeCategory === cat;
                    return (
                      <button key={cat} onClick={() => setActiveCategory(cat)}
                        className="px-3 py-1 rounded-full text-xs font-bold transition-all flex-shrink-0"
                        style={{ background: isActive ? `${catColor}22` : "rgba(255,255,255,0.04)", border: isActive ? `1px solid ${catColor}55` : "1px solid rgba(255,255,255,0.07)", color: isActive ? catColor : "rgba(255,255,255,0.4)" }}>
                        {cat}
                      </button>
                    );
                  })}
                </div>
                {/* 1-col on mobile, 2-col on sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <AnimatePresence mode="wait">
                    {bundleCatalogue[activeCategory].map((bundle, i) => (
                      <motion.div key={`${activeCategory}-${bundle.name}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}>
                        <BundleCard bundle={bundle} categoryColor={categoryColors[activeCategory].color} onAdd={addToBundle} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            ) : activeTab === "custom" ? (
              <div>
                <p className="text-white/45 text-xs mb-4">Select individual agents to compose your unique bundle.</p>
                <CustomBundleBuilder onClose={onClose} onSave={saveCustomBundle} />
              </div>
            ) : (
              <div>
                {savedBundles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 sm:py-24 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: "rgba(168,85,247,0.08)", border: "1px dashed rgba(168,85,247,0.3)" }}>
                      <BookMarked className="w-7 h-7" style={{ color: "rgba(168,85,247,0.4)" }} />
                    </div>
                    <h3 className="text-white/50 font-semibold text-sm mb-1">No saved bundles yet</h3>
                    <p className="text-white/25 text-xs max-w-xs">Build a bundle from the catalogue or create your own — it'll appear here once saved.</p>
                    <button onClick={() => setActiveTab("examples")}
                      className="mt-5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", color: "#C084FC" }}>
                      Browse Catalogue →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <AnimatePresence>
                      {savedBundles.map((saved, i) => (
                        <motion.div key={saved.id} className="relative rounded-xl p-4 group"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(168,85,247,0.2)" }}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{ background: saved.source === "custom" ? "rgba(6,182,212,0.15)" : "rgba(168,85,247,0.15)", color: saved.source === "custom" ? "#06B6D4" : "#C084FC", border: `1px solid ${saved.source === "custom" ? "rgba(6,182,212,0.3)" : "rgba(168,85,247,0.3)"}` }}>
                              {saved.source === "custom" ? "Custom" : "Catalogue"}
                            </span>
                            <div className="flex items-center gap-1 text-white/25 text-xs">
                              <Clock className="w-3 h-3" />{saved.createdAt}
                            </div>
                          </div>
                          <h4 className="text-white font-semibold text-sm leading-snug mb-2 pr-6">{saved.bundleName}</h4>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {saved.agents.slice(0, 4).map((a, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded-full text-xs"
                                style={{ background: "rgba(168,85,247,0.12)", color: "#C084FC", border: "1px solid rgba(168,85,247,0.22)" }}>{a}</span>
                            ))}
                            {saved.agents.length > 4 && (
                              <span className="px-1.5 py-0.5 rounded-full text-xs text-white/35"
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                +{saved.agents.length - 4} more
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="text-white/35 text-xs">{saved.agents.length} agents total</span>
                            <div className="flex gap-2">
                              {deleteConfirm === saved.id ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-white/40 text-xs">Delete?</span>
                                  <button onClick={() => deleteSaved(saved.id)} className="px-2 py-0.5 rounded text-xs font-semibold text-red-400" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>Yes</button>
                                  <button onClick={() => setDeleteConfirm(null)} className="px-2 py-0.5 rounded text-xs font-semibold text-white/50" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>No</button>
                                </div>
                              ) : (
                                <button onClick={() => setDeleteConfirm(saved.id)} className="text-white/20 hover:text-red-400 transition-colors p-1 rounded">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <motion.button className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold"
                                style={{ background: "rgba(168,85,247,0.18)", border: "1px solid rgba(168,85,247,0.35)", color: "#C084FC" }}
                                whileHover={{ background: "rgba(168,85,247,0.3)" }} whileTap={{ scale: 0.96 }}>
                                Request Quote <ArrowRight className="w-3 h-3" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right panel: My Bundle — desktop sidebar only ── */}
          {activeTab === "examples" && (
            <div className="hidden sm:flex flex-col" style={{ width: "240px", flexShrink: 0, minHeight: 0, borderLeft: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <h3 className="text-white font-semibold text-xs flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" style={{ color: "#A855F7" }} /> My Bundle
                </h3>
              </div>
              <div style={{ flex: "1 1 0", minHeight: 0, overflowY: "auto", padding: "12px 16px" }}>
                {myBundle.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-10">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: "rgba(168,85,247,0.08)", border: "1px dashed rgba(168,85,247,0.25)" }}>
                      <Package className="w-5 h-5 text-white/15" />
                    </div>
                    <p className="text-white/25 text-xs leading-relaxed">Click "Add" on any bundle to start building</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <AnimatePresence>
                      {myBundle.map((bundle) => {
                        const cat = Object.keys(bundleCatalogue).find((c) => bundleCatalogue[c].some((b) => b.name === bundle.name));
                        const catColor = cat ? categoryColors[cat].color : "#A855F7";
                        return (
                          <motion.div key={bundle.name} className="flex items-start gap-2 p-2.5 rounded-lg"
                            style={{ background: `${catColor}10`, border: `1px solid ${catColor}25` }}
                            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-xs font-semibold leading-snug">{bundle.name}</p>
                              <p className="text-xs mt-0.5" style={{ color: catColor }}>{bundle.agents.length} agents</p>
                            </div>
                            <button onClick={() => removeFromBundle(bundle.name)} className="text-white/20 hover:text-red-400 transition-colors mt-0.5">
                              <Minus className="w-3 h-3" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
              {myBundle.length > 0 && (
                <div className="px-4 pb-4 flex-shrink-0">
                  <motion.button onClick={saveCurrentBundle}
                    className="w-full py-2.5 rounded-xl font-bold text-black text-xs flex items-center justify-center gap-1.5"
                    style={{ background: "linear-gradient(135deg, #A855F7, #C084FC)" }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Check className="w-3.5 h-3.5" /> Save Bundle
                  </motion.button>
                  <p className="text-white/20 text-xs text-center mt-1.5">Saved to My Bundles tab</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Mobile: My Bundle bottom sheet ── */}
        <AnimatePresence>
          {showMobilePanel && activeTab === "examples" && (
            <motion.div className="sm:hidden absolute inset-0 z-50 flex flex-col" style={{ background: "linear-gradient(160deg, #0e0820 0%, #1a0d35 100%)" }}
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4" style={{ color: "#A855F7" }} /> My Bundle ({myBundle.length})
                </h3>
                <button onClick={() => setShowMobilePanel(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col gap-2">
                  {myBundle.map((bundle) => {
                    const cat = Object.keys(bundleCatalogue).find((c) => bundleCatalogue[c].some((b) => b.name === bundle.name));
                    const catColor = cat ? categoryColors[cat].color : "#A855F7";
                    return (
                      <motion.div key={bundle.name} className="flex items-start gap-3 p-3 rounded-xl"
                        style={{ background: `${catColor}10`, border: `1px solid ${catColor}25` }}
                        initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold leading-snug">{bundle.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: catColor }}>{bundle.agents.length} agents</p>
                        </div>
                        <button onClick={() => removeFromBundle(bundle.name)} className="text-white/20 hover:text-red-400 transition-colors">
                          <Minus className="w-4 h-4" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              {myBundle.length > 0 && (
                <div className="p-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <motion.button onClick={() => { saveCurrentBundle(); setShowMobilePanel(false); }}
                    className="w-full py-3 rounded-xl font-bold text-black text-sm flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #A855F7, #C084FC)" }}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Check className="w-4 h-4" /> Save Bundle
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Added-feedback toast */}
        <AnimatePresence>
          {addedFeedback && (
            <motion.div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap"
              style={{ background: "rgba(168,85,247,0.28)", border: "1px solid rgba(168,85,247,0.45)", color: "#E0AAFF", backdropFilter: "blur(12px)", zIndex: 60 }}
              initial={{ opacity: 0, y: 12, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }}>
              <Check className="w-3 h-3" /> Added: {addedFeedback}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}

// ─── Exported Section Component ───
export function CreateBundleSection({ product }: { product: { color: string } }) {
  const [showBundle, setShowBundle] = useState(false);
  const accentColor = product?.color || "#A855F7";

  return (
    <>
      <motion.div className="mb-16"
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }} transition={{ duration: 0.6 }}>

        {/* ── Stacked on mobile, side-by-side on lg ── */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-14 items-center gap-5">

          {/* Heading */}
          <div className="lg:col-span-1 text-center lg:text-left">
            <p className="text-white/40 text-sm sm:text-base mb-2">Need something tailored?</p>
            <h3 className="text-2xl sm:text-3xl font-light text-white">
              Create your{" "}
              <motion.button onClick={() => setShowBundle(true)}
                className="relative font-semibold cursor-pointer"
                style={{ color: accentColor }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                bundle
                <motion.span className="absolute left-0 -bottom-0.5 h-px w-full"
                  style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
                  initial={{ scaleX: 0, originX: 0 }} whileInView={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.3 }} />
                <motion.span className="absolute -top-1.5 -right-4 text-xs"
                  animate={{ opacity: [0.5, 1, 0.5], y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ color: accentColor }}>✦</motion.span>
              </motion.button>
            </h3>
          </div>

          {/* Card — full width on mobile, spans 2 cols on lg */}
          <div className="lg:col-span-2 w-full">
            <motion.button onClick={() => setShowBundle(true)}
              className="group flex items-center gap-4 px-5 sm:px-6 py-4 sm:py-5 rounded-2xl w-full text-left relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${accentColor}10, ${accentColor}04)`, border: `1px solid ${accentColor}28` }}
              whileHover={{ borderColor: `${accentColor}55`, scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `radial-gradient(circle at 30% 50%, ${accentColor}10, transparent 70%)` }} />
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10"
                style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}38` }}>
                <Package className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: accentColor }} />
              </div>
              <div className="flex-1 relative z-10 min-w-0">
                <h4 className="text-white font-semibold text-sm mb-0.5">Bundle Builder</h4>
                <p className="text-white/40 text-xs sm:text-sm leading-snug">
                  Choose from curated packs across Finance, Supply Chain &amp; Front Office — or compose your own from 70+ agents.
                </p>
              </div>
              <motion.div className="relative z-10 flex-shrink-0" animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: accentColor }} />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showBundle && <BundleOverlay onClose={() => setShowBundle(false)} />}
      </AnimatePresence>
    </>
  );
}