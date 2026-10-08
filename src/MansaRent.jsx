import React, { useState, useEffect, useRef, useMemo, createContext, useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  Menu, X, Search, MapPin, Home, Building2, Bed, Bath, Briefcase, Store,
  DoorOpen, Hotel, ShieldCheck, Users, Wallet, BarChart3,
  Star, Facebook, Instagram, ArrowRight, ArrowLeft, Sparkles, Check,
  TrendingUp, Eye, Heart, Phone, ChevronRight, SlidersHorizontal,
  ImagePlus, Maximize2, User, LogOut, Plus, Mail, Lock, Square,
  MessageSquare, Send, CreditCard, Smartphone, Clock, Crown, BadgeCheck
} from "lucide-react";
import { PaymentAPI } from "./services/api.js";

const VILLES_KEYS = ["Conakry", "Kankan", "Kindia", "Nzérékoré", "Labé", "Mamou", "Boké"];
const TYPES_KEYS = ["Maison", "Appartement", "Chambre", "Villa", "Bureau", "Boutique"];
const LOCATIONS_KEYS = ["longStay", "shortStay"];

const POOL = {
  Maison: ["photo-1568605114967-8130f3a36994", "photo-1564013799919-ab600027ffc6", "photo-1605276374104-dee2a0ed3cd6", "photo-1583608205776-bfd35f0d9f83"],
  Appartement: ["photo-1502672260266-1c1ef2d93688", "photo-1522708323590-d24dbb6b0267", "photo-1493809842364-78817add7ffb", "photo-1560448204-e02f11c3d0e2"],
  Villa: ["photo-1613490493576-7fde63acd811", "photo-1512917774080-9991f1c4c750", "photo-1600596542815-ffad4c1539a9", "photo-1564013799919-ab600027ffc6"],
  Chambre: ["photo-1505691938895-1758d7feb511", "photo-1522771739844-6a9f6d5f14af", "photo-1598928506311-c55ded91a20c"],
  Bureau: ["photo-1497366754035-f200968a6e72", "photo-1497366811353-6870744d04b2", "photo-1524758631624-e2822e304c36"],
  Boutique: ["photo-1604719312566-8912e9227c6a", "photo-1441986300917-64674bd600d8", "photo-1555529669-e69e7aa0ba9a"],
};
const url = (id, w = 800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const imgs = (type, w = 800) => POOL[type].map((id) => url(id, w));

const LANDLORDS = [
  { name: "Mamadou Baldé", phone: "+224 620 11 22 33", roleKey: "landlordRoles.Propriétaire", cityKey: "cities.Conakry", since: 2021, bioKey: "landlordBios.bio1" },
  { name: "Aïssatou Diallo", phone: "+224 622 44 55 66", roleKey: "landlordRoles.Agente immobilière", cityKey: "cities.Conakry", since: 2020, bioKey: "landlordBios.bio2" },
  { name: "Ibrahima Sow", phone: "+224 628 77 88 99", roleKey: "landlordRoles.Propriétaire", cityKey: "cities.Conakry", since: 2022, bioKey: "landlordBios.bio3" },
  { name: "Fatoumata Camara", phone: "+224 621 00 11 22", roleKey: "landlordRoles.Agente immobilière", cityKey: "cities.Kindia", since: 2019, bioKey: "landlordBios.bio4" },
];
const AMEN_KEYS = ["Climatisation", "Eau courante", "Groupe électrogène", "Parking", "Sécurité 24/7", "Internet / Fibre", "Cuisine équipée", "Balcon", "Jardin", "Meublé", "Piscine", "Ascenseur"];

const SEED_PROPERTIES = [
  { id: 1, titleKey: "seedProperties.p1.title", type: "Maison", rentalTypeKey: "rentalTypes.longStay", price: 6200000, cityKey: "cities.Conakry", neighborhood: "Kipé", beds: 3, baths: 2, area: 180, featured: true, tagKey: "tags.featured", amenities: [0,1,2,3,4,6], landlord: 0 },
  { id: 2, titleKey: "seedProperties.p2.title", type: "Appartement", rentalTypeKey: "rentalTypes.longStay", price: 3400000, cityKey: "cities.Conakry", neighborhood: "Kaloum", beds: 2, baths: 1, area: 95, featured: true, tagKey: "tags.new", amenities: [0,1,5,7,11], landlord: 1 },
  { id: 3, titleKey: "seedProperties.p3.title", type: "Villa", rentalTypeKey: "rentalTypes.longStay", price: 12000000, cityKey: "cities.Conakry", neighborhood: "Camayenne", beds: 5, baths: 4, area: 420, featured: true, tagKey: "tags.premium", amenities: [0,1,2,3,4,8,10], landlord: 2 },
  { id: 4, titleKey: "seedProperties.p4.title", type: "Chambre", rentalTypeKey: "rentalTypes.shortStay", price: 1100000, cityKey: "cities.Conakry", neighborhood: "Ratoma", beds: 1, baths: 1, area: 35, featured: false, tagKey: "tags.shortStay", amenities: [0,1,5,9], landlord: 3 },
  { id: 5, titleKey: "seedProperties.p5.title", type: "Bureau", rentalTypeKey: "rentalTypes.longStay", price: 5000000, cityKey: "cities.Conakry", neighborhood: "Kaloum", beds: 0, baths: 2, area: 140, featured: false, tagKey: "tags.commercial", amenities: [0,1,2,4,5,11], landlord: 0 },
  { id: 6, titleKey: "seedProperties.p6.title", type: "Maison", rentalTypeKey: "rentalTypes.longStay", price: 7800000, cityKey: "cities.Kankan", neighborhood: "Centre", beds: 4, baths: 3, area: 260, featured: true, tagKey: "tags.featured", amenities: [1,2,3,8,6], landlord: 1 },
  { id: 7, titleKey: "seedProperties.p7.title", type: "Appartement", rentalTypeKey: "rentalTypes.shortStay", price: 2200000, cityKey: "cities.Conakry", neighborhood: "Dixinn", beds: 2, baths: 1, area: 80, featured: true, tagKey: "tags.furnished", amenities: [0,1,5,9,6,7], landlord: 3 },
  { id: 8, titleKey: "seedProperties.p8.title", type: "Villa", rentalTypeKey: "rentalTypes.longStay", price: 15000000, cityKey: "cities.Conakry", neighborhood: "Kipé", beds: 6, baths: 5, area: 500, featured: true, tagKey: "tags.premium", amenities: [0,1,2,3,4,8,10,11], landlord: 2 },
  { id: 9, titleKey: "seedProperties.p9.title", type: "Chambre", rentalTypeKey: "rentalTypes.longStay", price: 600000, cityKey: "cities.Kindia", neighborhood: "Centre", beds: 1, baths: 1, area: 20, featured: false, tagKey: "tags.economical", amenities: [1,5], landlord: 0 },
  { id: 10, titleKey: "seedProperties.p10.title", type: "Boutique", rentalTypeKey: "rentalTypes.longStay", price: 4500000, cityKey: "cities.Conakry", neighborhood: "Madina", beds: 0, baths: 1, area: 60, featured: false, tagKey: "tags.commercial", amenities: [1,2,4], landlord: 1 },
  { id: 11, titleKey: "seedProperties.p11.title", type: "Appartement", rentalTypeKey: "rentalTypes.shortStay", price: 3800000, cityKey: "cities.Conakry", neighborhood: "Corniche", beds: 3, baths: 2, area: 120, featured: false, tagKey: "tags.shortStay", amenities: [0,1,5,7,9,11], landlord: 3 },
  { id: 12, titleKey: "seedProperties.p12.title", type: "Maison", rentalTypeKey: "rentalTypes.longStay", price: 2900000, cityKey: "cities.Labé", neighborhood: "Centre", beds: 3, baths: 2, area: 150, featured: false, tagKey: "tags.new", amenities: [1,2,3,8], landlord: 2 },
];

const SEED_REVIEWS = [
  { id: "rv1", agentId: 0, propertyId: null, author: "Sékou T.", rating: 5, textKey: "seedReviews.rv1", ts: Date.now() - 6 * 86400000 },
  { id: "rv2", agentId: 0, propertyId: 1, author: "Mariama B.", rating: 4, textKey: "seedReviews.rv2", ts: Date.now() - 3 * 86400000 },
  { id: "rv3", agentId: 1, propertyId: null, author: "Ousmane D.", rating: 5, textKey: "seedReviews.rv3", ts: Date.now() - 10 * 86400000 },
  { id: "rv4", agentId: 2, propertyId: null, author: "Kadiatou S.", rating: 4, textKey: "seedReviews.rv4", ts: Date.now() - 14 * 86400000 },
  { id: "rv5", agentId: 3, propertyId: null, author: "Alpha C.", rating: 5, textKey: "seedReviews.rv5", ts: Date.now() - 20 * 86400000 },
];

const formatGNF = (n) => {
  if (n >= 1_000_000) {
    const s = (Math.round((n / 1_000_000) * 10) / 10).toString().replace(".", ",");
    return `${s}M GNF`;
  }
  if (n >= 1000) return `${Math.round(n / 1000)}k GNF`;
  return `${n} GNF`;
};
const landlordOf = (p) => p.landlordInfo || LANDLORDS[p.landlord ?? 0] || LANDLORDS[0];
const galleryOf = (p) => (p.images && p.images.length ? p.images : imgs(p.type, 1000));
const coverOf = (p) => (p.images && p.images.length ? p.images[0] : url(POOL[p.type][0], 800));

const SUBSCRIPTION_PRICE = 50000;
const TRIAL_DAYS = 30;
const DAY = 86400000;
const daysLeft = (ts) => Math.max(0, Math.ceil((ts - Date.now()) / DAY));
const isSubscribed = (u) => !!(u && u.subscribedUntil && u.subscribedUntil > Date.now());
const inTrial = (u) => !!(u && u.trialEndsAt && u.trialEndsAt > Date.now());
const canPost = (u) => !!u && (isSubscribed(u) || inTrial(u));
const fmtDate = (ts) => new Date(ts).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
const agentOf = (p) => (typeof p.landlord === "number" ? p.landlord : null);

const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

const EMPTY_FILTERS = { city: "", type: "", rental: "", beds: 0, minPrice: 0, maxPrice: 0, q: "", sort: "rel" };

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      .mr-display { font-family: 'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif; letter-spacing: -0.02em; }
      .mr-body, .mr-root { font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif; }
      .mr-root { -webkit-font-smoothing: antialiased; }
      @keyframes mrUp { from { opacity:0; transform:translateY(24px);} to {opacity:1; transform:translateY(0);} }
      .mr-reveal { opacity:0; } .mr-reveal.mr-in { animation: mrUp .65s cubic-bezier(.2,.7,.2,1) forwards; }
      @keyframes mrFloat { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
      .mr-float { animation: mrFloat 6s ease-in-out infinite; }
      @keyframes mrBlob { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(20px,-30px) scale(1.08);} 66%{transform:translate(-18px,16px) scale(.94);} }
      .mr-blob { animation: mrBlob 16s ease-in-out infinite; }
      @keyframes mrToast { from{opacity:0; transform:translateY(16px);} to {opacity:1; transform:translateY(0);} }
      .mr-toast { animation: mrToast .35s ease forwards; }
      .mr-grain { background-image: repeating-linear-gradient(45deg, rgba(212,148,5,.12) 0 1px, transparent 1px 16px), repeating-linear-gradient(-45deg, rgba(212,148,5,.12) 0 1px, transparent 1px 16px); }
      .mr-noscroll { overflow:hidden; }
      html { scroll-behavior:smooth; }
      select.mr-sel { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right .8rem center; }
    `}</style>
  );
}

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`mr-reveal ${shown ? "mr-in" : ""} ${className}`} style={{ animationDelay: `${delay}ms` }}>{children}</div>;
}

const Btn = ({ children, variant = "solid", className = "", ...props }) => {
  const base = "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:opacity-50";
  const styles = {
    solid: "bg-teal-700 text-white hover:bg-teal-800 shadow-lg shadow-teal-700/20",
    amber: "bg-amber-500 text-teal-900 hover:bg-amber-400 shadow-lg shadow-amber-600/25",
    ghost: "bg-white text-teal-800 ring-1 ring-teal-200 hover:ring-teal-400 hover:bg-teal-50",
    outline: "bg-transparent text-teal-800 ring-2 ring-teal-700 hover:bg-teal-700 hover:text-white",
    green: "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20",
    dark: "bg-gray-900 text-white hover:bg-gray-800",
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props}>{children}</button>;
};

const SectionTag = ({ children }) => (
  <span className="inline-flex items-center gap-2.5 rounded-full bg-teal-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700 ring-1 ring-teal-100">
    <span className="h-2 w-2 rotate-45 rounded-[1px] bg-amber-500" /> {children}
  </span>
);

function Avatar({ name = "?", src = null, size = 36, className = "" }) {
  const dim = { width: size, height: size };
  if (src) return <img src={src} alt={name} referrerPolicy="no-referrer" style={dim} className={`shrink-0 rounded-full object-cover ${className}`} />;
  return (
    <span style={{ ...dim, fontSize: Math.round(size * 0.42) }} className={`grid shrink-0 place-items-center rounded-full bg-teal-700 font-bold text-white ${className}`}>
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}

function Logo({ light = false }) {
  const { navigate } = useApp();
  return (
    <button onClick={() => navigate("home")} className="flex items-center gap-2.5 select-none">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 text-white shadow-md shadow-teal-700/30">
        <Home size={18} strokeWidth={2.5} />
      </span>
      <span className={`mr-display text-xl font-extrabold ${light ? "text-white" : "text-gray-900"}`}>Mansa<span className="text-amber-500">Rent</span></span>
    </button>
  );
}

function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className="fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div className="mr-toast flex items-center gap-3 rounded-2xl bg-gray-900 px-5 py-3.5 text-sm font-medium text-white shadow-2xl">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-teal-500"><Check size={14} strokeWidth={3} /></span>
        {toast}
      </div>
    </div>
  );
}

const NAV = [
  ["nav.home", () => ({ name: "home" })],
  ["nav.properties", () => ({ name: "listings", reset: true })],
  ["nav.shortStay", () => ({ name: "listings", preset: { ...EMPTY_FILTERS, rental: "shortStay" } })],
  ["nav.longStay", () => ({ name: "listings", preset: { ...EMPTY_FILTERS, rental: "longStay" } })],
  ["nav.agents", () => ({ name: "home", anchor: "agents" })],
  ["nav.about", () => ({ name: "home", anchor: "apropos" })],
  ["nav.contact", () => ({ name: "home", anchor: "contact" })],
];

function Navbar() {
  const { navigate, setFilters, openAuth, favorites, user, logout, conversations, i18n } = useApp();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const unread = conversations.filter((c) => c.unread).length;
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { document.body.classList.toggle("mr-noscroll", open); }, [open]);

  const go = (fn) => {
    const r = fn();
    if (r.reset) setFilters(EMPTY_FILTERS);
    if (r.preset) setFilters(r.preset);
    navigate(r.name, r.anchor ? { anchor: r.anchor } : {});
    setOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-white"}`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
        <Logo />
        <ul className="hidden items-center gap-6 lg:flex">
          {NAV.map(([key, fn]) => (
            <li key={key}>
              <button onClick={() => go(fn)} className="text-sm font-medium text-gray-600 transition-colors hover:text-teal-700">{t(key)}</button>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-2.5 lg:flex">
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 ring-1 ring-gray-200 hover:text-teal-700"
              aria-label="Language"
            >
              {i18n.language === "fr" ? "FR" : "EN"}
              <ChevronRight size={14} className={`transition-transform ${langOpen ? "rotate-90" : ""}`} />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 w-32 rounded-xl bg-white p-1 shadow-xl ring-1 ring-gray-200">
                <button
                  onClick={() => { i18n.changeLanguage("fr"); setLangOpen(false); }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition hover:bg-teal-50 ${i18n.language === "fr" ? "bg-teal-50 text-teal-700" : "text-gray-600"}`}
                >
                  Français
                </button>
                <button
                  onClick={() => { i18n.changeLanguage("en"); setLangOpen(false); }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition hover:bg-teal-50 ${i18n.language === "en" ? "bg-teal-50 text-teal-700" : "text-gray-600"}`}
                >
                  English
                </button>
              </div>
            )}
          </div>
          <button onClick={() => navigate("messages")} className="relative grid h-10 w-10 place-items-center rounded-xl text-gray-600 ring-1 ring-gray-200 hover:text-teal-700" aria-label={t("nav.messages")}>
            <MessageSquare size={18} />
            {unread > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-teal-900">{unread}</span>}
          </button>
          <button onClick={() => navigate("favorites")} className="relative grid h-10 w-10 place-items-center rounded-xl text-gray-600 ring-1 ring-gray-200 hover:text-rose-500" aria-label={t("nav.favorites")}>
            <Heart size={18} />
            {favorites.length > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{favorites.length}</span>}
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center"><Avatar name={user.name} src={user.avatar} size={36} /></span>
              <button onClick={logout} className="grid h-10 w-10 place-items-center rounded-xl text-gray-600 ring-1 ring-gray-200 hover:text-teal-700" aria-label={t("nav.logout")}><LogOut size={18} /></button>
            </div>
          ) : (
            <Btn variant="ghost" className="px-5 py-2.5 text-sm" onClick={openAuth}>{t("nav.login")}</Btn>
          )}
          <Btn variant="solid" className="px-5 py-2.5 text-sm" onClick={() => navigate("post")}>{t("nav.post")}</Btn>
        </div>
        <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl text-gray-700 ring-1 ring-gray-200 lg:hidden" aria-label={t("nav.menu")}><Menu size={20} /></button>
      </nav>

      <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}>
        <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-gray-900/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
        <div className={`absolute right-0 top-0 h-full w-[84%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <Logo />
            <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl text-gray-700 ring-1 ring-gray-200" aria-label={t("nav.close")}><X size={20} /></button>
          </div>
          <ul className="flex flex-col px-3 py-3">
            {NAV.map(([key, fn]) => (
              <li key={key}>
                <button onClick={() => go(fn)} className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-base font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700">
                  {t(key)} <ChevronRight size={18} className="text-gray-300" />
                </button>
              </li>
            ))}
            <li>
              <button onClick={() => { navigate("messages"); setOpen(false); }} className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-base font-medium text-gray-700 hover:bg-teal-50">
                {t("nav.messages")} <span className="flex items-center gap-1 text-teal-700"><MessageSquare size={16} /> {unread > 0 ? unread : ""}</span>
              </button>
            </li>
            <li>
              <button onClick={() => { navigate("favorites"); setOpen(false); }} className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-base font-medium text-gray-700 hover:bg-teal-50">
                {t("nav.favorites")} <span className="flex items-center gap-1 text-rose-500"><Heart size={16} /> {favorites.length}</span>
              </button>
            </li>
          </ul>
          <div className="mt-1 flex flex-col gap-3 px-5">
            {user
              ? <Btn variant="ghost" className="w-full py-3" onClick={() => { logout(); setOpen(false); }}><LogOut size={16} /> {t("nav.logout")} ({user.name})</Btn>
              : <Btn variant="ghost" className="w-full py-3" onClick={() => { openAuth(); setOpen(false); }}>{t("nav.login")}</Btn>}
            <Btn variant="solid" className="w-full py-3" onClick={() => { navigate("post"); setOpen(false); }}><Plus size={16} /> {t("nav.postListing")}</Btn>
          </div>
        </div>
      </div>
    </header>
  );
}

function SearchBar({ big = true }) {
  const { setFilters, navigate } = useApp();
  const { t } = useTranslation();
  const [q, setQ] = useState({ city: "", type: "", rental: "" });
  const sel = "mr-sel w-full appearance-none rounded-2xl border-0 bg-gray-50 px-4 py-3.5 pr-9 text-sm font-medium text-gray-800 ring-1 ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500";
  const submit = () => { setFilters({ ...EMPTY_FILTERS, ...q }); navigate("listings"); };
  const Field = ({ icon, label, value, onChange, placeholder, options }) => (
    <label className="flex flex-1 flex-col gap-1.5">
      <span className="flex items-center gap-1.5 px-1 text-xs font-semibold text-gray-500">{icon}{label}</span>
      <select className={sel} value={value} onChange={onChange}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{t(o.startsWith("rentalTypes.") ? o : `cities.${o}`)}</option>)}
      </select>
    </label>
  );
  return (
    <div className={`rounded-[28px] bg-white p-4 ring-1 ring-gray-100 ${big ? "shadow-2xl shadow-teal-900/10" : "shadow-lg"}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <Field icon={<MapPin size={13} />} label={t("hero.search.city")} placeholder={t("hero.search.cityPlaceholder")} options={VILLES_KEYS} value={q.city} onChange={(e) => setQ({ ...q, city: e.target.value })} />
        <Field icon={<Home size={13} />} label={t("hero.search.type")} placeholder={t("hero.search.typePlaceholder")} options={TYPES_KEYS} value={q.type} onChange={(e) => setQ({ ...q, type: e.target.value })} />
        <Field icon={<Wallet size={13} />} label={t("hero.search.rentalType")} placeholder={t("hero.search.rentalTypePlaceholder")} options={LOCATIONS_KEYS} value={q.rental} onChange={(e) => setQ({ ...q, rental: e.target.value })} />
        <Btn variant="amber" className="w-full px-6 py-3.5 md:w-auto md:py-[26px]" onClick={submit}><Search size={18} /> {t("hero.search.search")}</Btn>
      </div>
    </div>
  );
}

function Hero() {
  const { setFilters, navigate } = useApp();
  const { t } = useTranslation();
  return (
    <section id="accueil" className="relative overflow-hidden bg-gradient-to-b from-teal-50/70 via-white to-white pt-8 lg:pt-14">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal-200/40 blur-3xl mr-blob" />
      <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl mr-blob" style={{ animationDelay: "4s" }} />
      <div className="pointer-events-none absolute inset-0 mr-grain opacity-40" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-10 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pb-20">
        <div className="text-center lg:text-left">
          <Reveal><span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-teal-700 shadow-sm ring-1 ring-teal-100"><span className="grid h-4 w-4 place-items-center rounded-full bg-amber-500 text-white"><Check size={10} strokeWidth={4} /></span>{t("hero.badge")}</span></Reveal>
          <Reveal delay={80}>
            <h1 className="mr-display mt-5 text-4xl font-extrabold leading-[1.05] text-gray-900 sm:text-5xl lg:text-6xl">
              {t("hero.title1")} <span className="relative whitespace-nowrap text-teal-700">{t("hero.title2")}<svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none"><path d="M2 9C50 3 150 3 198 9" stroke="#d49405" strokeWidth="4" strokeLinecap="round" /></svg></span> {t("hero.title3")}
            </h1>
          </Reveal>
          <Reveal delay={160}><p className="mx-auto mt-5 max-w-xl text-base text-gray-600 lg:mx-0 lg:text-lg">{t("hero.subtitle")}</p></Reveal>
          <Reveal delay={240}><p className="mr-display mt-3 text-sm font-bold uppercase tracking-[0.2em] text-amber-500">{t("hero.slogan")}</p></Reveal>
          <Reveal delay={320}>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Btn variant="solid" className="px-7 py-3.5" onClick={() => { setFilters(EMPTY_FILTERS); navigate("listings"); }}>{t("hero.find")} <ArrowRight size={18} /></Btn>
              <Btn variant="outline" className="px-7 py-3.5" onClick={() => navigate("post")}>{t("hero.post")}</Btn>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <div className="mt-8 flex items-center justify-center gap-8 lg:justify-start">
              {[["12k+", t("hero.listings")], ["8", t("hero.regions")], ["4,9★", t("hero.avgRating")]].map(([n, l]) => (
                <div key={l} className="text-center lg:text-left"><div className="mr-display text-2xl font-extrabold text-gray-900">{n}</div><div className="text-xs font-medium text-gray-500">{l}</div></div>
              ))}
            </div>
          </Reveal>
        </div>
        <Reveal delay={200} className="relative">
          <div className="relative mr-float">
            <div className="overflow-hidden rounded-[32px] shadow-2xl shadow-teal-900/20 ring-1 ring-black/5">
              <img loading="eager" alt={t("hero.title3")} src={url("photo-1545324418-cc1a3fa10c00", 900)} className="h-[360px] w-full object-cover sm:h-[460px]" />
            </div>
            <div className="absolute -bottom-5 -left-3 hidden rounded-2xl bg-white p-3.5 shadow-xl ring-1 ring-gray-100 sm:block">
              <div className="flex items-center gap-3">
                <img alt="Villa" src={url("photo-1613490493576-7fde63acd811", 200)} className="h-12 w-12 rounded-xl object-cover" />
                <div><div className="text-xs text-gray-500">Villa · Conakry</div><div className="mr-display font-bold text-teal-700">8,5M GNF<span className="text-xs font-medium text-gray-400">{t("propertyCard.perMonth")}</span></div></div>
              </div>
            </div>
            <div className="absolute -right-2 top-6 hidden items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 shadow-xl ring-1 ring-gray-100 sm:flex">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-teal-100 text-teal-700"><ShieldCheck size={16} /></span>
              <div className="text-xs font-semibold text-gray-700">{t("detail.verified")}</div>
            </div>
          </div>
        </Reveal>
      </div>
      <Reveal delay={300}><div className="relative mx-auto -mt-2 max-w-5xl px-5 pb-12 lg:px-8 lg:pb-16"><SearchBar /></div></Reveal>
    </section>
  );
}

const CATEGORIES = [
  { nameKey: "categories.Maisons", type: "Maison", icon: Home, count: "3 200+", img: url("photo-1568605114967-8130f3a36994", 600) },
  { nameKey: "categories.Appartements", type: "Appartement", icon: Building2, count: "4 100+", img: url("photo-1502672260266-1c1ef2d93688", 600) },
  { nameKey: "categories.Chambres", type: "Chambre", icon: DoorOpen, count: "1 800+", img: url("photo-1505691938895-1758d7feb511", 600) },
  { nameKey: "categories.Villas", type: "Villa", icon: Hotel, count: "640+", img: url("photo-1613490493576-7fde63acd811", 600) },
  { nameKey: "categories.Bureaux", type: "Bureau", icon: Briefcase, count: "520+", img: url("photo-1497366754035-f200968a6e72", 600) },
  { nameKey: "categories.Boutiques", type: "Boutique", icon: Store, count: "380+", img: url("photo-1604719312566-8912e9227c6a", 600) },
];

function Categories() {
  const { setFilters, navigate } = useApp();
  const { t } = useTranslation();
  const go = (type) => { setFilters({ ...EMPTY_FILTERS, type }); navigate("listings"); };
  return (
    <section id="proprietes" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <Reveal className="mb-10 text-center">
        <SectionTag>{t("categories.tag")}</SectionTag>
        <h2 className="mr-display mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">{t("categories.title")}</h2>
        <p className="mx-auto mt-3 max-w-lg text-gray-600">{t("categories.subtitle")}</p>
      </Reveal>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((c, i) => (
          <Reveal key={c.nameKey} delay={i * 70}>
            <button onClick={() => go(c.type)} className="group block w-full overflow-hidden rounded-3xl bg-white text-left shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:ring-teal-200">
              <div className="relative h-28 overflow-hidden bg-gray-100">
                <img loading="lazy" alt={t(c.nameKey)} src={c.img} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <span className="absolute left-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-xl bg-white/95 text-teal-700 shadow-sm backdrop-blur"><c.icon size={18} /></span>
              </div>
              <div className="px-3.5 py-3"><div className="mr-display font-bold text-gray-900">{t(c.nameKey)}</div><div className="text-xs font-medium text-gray-400">{c.count} {t("categories.listings")}</div></div>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const CITY_CARDS = [
  { nameKey: "cities.Conakry", count: "6 400+", img: url("photo-1449034446853-66c86144b0ad", 800) },
  { nameKey: "cities.Kankan", count: "1 200+", img: url("photo-1502920917128-1aa500764cbd", 800) },
  { nameKey: "cities.Kindia", count: "860+", img: url("photo-1480714378408-67cf0d13bc1b", 800) },
  { nameKey: "cities.Labé", count: "540+", img: url("photo-1477959858617-67f85cf4f1df", 800) },
];

function Cities() {
  const { setFilters, navigate } = useApp();
  const { t } = useTranslation();
  const go = (cityKey) => { setFilters({ ...EMPTY_FILTERS, city: cityKey }); navigate("listings"); };
  return (
    <section className="mx-auto max-w-7xl px-5 pb-4 lg:px-8 lg:pb-12">
      <Reveal className="mb-8 text-center">
        <SectionTag>{t("cities.tag")}</SectionTag>
        <h2 className="mr-display mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">{t("cities.title")}</h2>
        <p className="mx-auto mt-3 max-w-lg text-gray-600">{t("cities.subtitle")}</p>
      </Reveal>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {CITY_CARDS.map((c, i) => (
          <Reveal key={c.nameKey} delay={i * 80}>
            <button onClick={() => go(c.nameKey)} className="group relative block h-56 w-full overflow-hidden rounded-3xl bg-gray-200 text-left shadow-sm ring-1 ring-gray-100 lg:h-72">
              <img loading="lazy" alt={t("cities.inCity", { city: t(c.nameKey) })} src={c.img} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4"><div className="mr-display text-lg font-extrabold text-white">{t(c.nameKey)}</div><div className="flex items-center gap-1 text-xs text-teal-100"><MapPin size={12} /> {c.count} {t("cities.properties")}</div></div>
              <span className="absolute right-3 top-3 grid h-9 w-9 translate-y-1 place-items-center rounded-full bg-white/90 text-teal-700 opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"><ArrowRight size={16} /></span>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  { n: "01", titleKey: "howItWorks.step1.title", descKey: "howItWorks.step1.desc", icon: Search },
  { n: "02", titleKey: "howItWorks.step2.title", descKey: "howItWorks.step2.desc", icon: MessageSquare },
  { n: "03", titleKey: "howItWorks.step3.title", descKey: "howItWorks.step3.desc", icon: Home },
];
function HowItWorks() {
  const { t } = useTranslation();
  return (
    <section id="courtsejour" className="relative overflow-hidden bg-teal-700 py-16 lg:py-24">
      <div className="pointer-events-none absolute inset-0 mr-grain opacity-20" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal-500/40 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-100">{t("howItWorks.tag")}</span>
          <h2 className="mr-display mt-4 text-3xl font-extrabold text-white sm:text-4xl">{t("howItWorks.title")}</h2>
          <p className="mx-auto mt-3 max-w-lg text-teal-100">{t("howItWorks.subtitle")}</p>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div className="relative h-full rounded-3xl bg-white/95 p-7 shadow-xl ring-1 ring-white/20 backdrop-blur transition-transform duration-300 hover:-translate-y-1.5">
                <span className="mr-display absolute right-6 top-5 text-5xl font-extrabold text-teal-100">{s.n}</span>
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white shadow-lg shadow-teal-700/30"><s.icon size={24} /></span>
                <h3 className="mr-display mt-5 text-xl font-bold text-gray-900">{t(s.titleKey)}</h3>
                <p className="mt-2 text-sm text-gray-600">{t(s.descKey)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: ShieldCheck, titleKey: "whyChoose.features.verified.title", descKey: "whyChoose.features.verified.desc", color: "text-teal-700 bg-teal-50" },
  { icon: Users, titleKey: "whyChoose.features.trusted.title", descKey: "whyChoose.features.trusted.desc", color: "text-amber-600 bg-amber-50" },
  { icon: Search, titleKey: "whyChoose.features.search.title", descKey: "whyChoose.features.search.desc", color: "text-teal-700 bg-teal-50" },
  { icon: MessageSquare, titleKey: "whyChoose.features.messaging.title", descKey: "whyChoose.features.messaging.desc", color: "text-teal-700 bg-teal-50" },
  { icon: ShieldCheck, titleKey: "whyChoose.features.safe.title", descKey: "whyChoose.features.safe.desc", color: "text-teal-700 bg-teal-50" },
  { icon: Wallet, titleKey: "whyChoose.features.payments.title", descKey: "whyChoose.features.payments.desc", color: "text-amber-600 bg-amber-50" },
];
function WhyChoose() {
  const { t } = useTranslation();
  return (
    <section id="apropos" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <Reveal className="mb-10 text-center">
        <SectionTag>{t("whyChoose.tag")}</SectionTag>
        <h2 className="mr-display mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">{t("whyChoose.title")}</h2>
        <p className="mx-auto mt-3 max-w-lg text-gray-600">{t("whyChoose.subtitle")}</p>
      </Reveal>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal key={f.titleKey} delay={i * 80}>
            <div className="group flex h-full items-start gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-teal-200">
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${f.color} transition-transform duration-300 group-hover:scale-110`}><f.icon size={22} /></span>
              <div><h3 className="mr-display text-lg font-bold text-gray-900">{t(f.titleKey)}</h3><p className="mt-1 text-sm text-gray-600">{t(f.descKey)}</p></div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function PropertyCard({ p, delay = 0 }) {
  const { navigate, favorites, toggleFavorite } = useApp();
  const { t } = useTranslation();
  const fav = favorites.includes(p.id);
  return (
    <Reveal delay={delay}>
      <article onClick={() => navigate("detail", { id: p.id })} className="group h-full cursor-pointer overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
        <div className="relative h-52 overflow-hidden bg-gray-100">
          <img loading="lazy" alt={t(p.titleKey)} src={coverOf(p)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
          {p.tagKey && <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow">{t(p.tagKey)}</span>}
          <button onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }} className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full backdrop-blur transition ${fav ? "bg-rose-500 text-white" : "bg-white/90 text-gray-500 hover:text-rose-500"}`} aria-label={t("propertyCard.favorite")}>
            <Heart size={16} fill={fav ? "currentColor" : "none"} />
          </button>
          <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-teal-700 backdrop-blur">{t(`types.${p.type}`)}</span>
        </div>
        <div className="p-5">
          <span className="mr-display text-xl font-extrabold text-teal-700">{formatGNF(p.price)}<span className="text-xs font-medium text-gray-400">{t("propertyCard.perMonth")}</span></span>
          <h3 className="mr-display mt-1 text-lg font-bold text-gray-900">{t(p.titleKey)}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500"><MapPin size={14} /> {p.neighborhood ? `${p.neighborhood}, ` : ""}{t(p.cityKey)}</p>
          <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-4 text-sm text-gray-600">
            <span className="flex items-center gap-1.5"><Bed size={16} className="text-teal-600" /> {p.beds} {t("propertyCard.beds", { count: p.beds })}</span>
            <span className="flex items-center gap-1.5"><Bath size={16} className="text-teal-600" /> {p.baths} {t("propertyCard.baths", { count: p.baths })}</span>
            <span className="ml-auto flex items-center gap-1 font-semibold text-teal-700">{t("propertyCard.view")} <ArrowRight size={14} /></span>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function Featured() {
  const { properties, setFilters, navigate } = useApp();
  const { t } = useTranslation();
  const list = properties.filter((p) => p.featured).slice(0, 6);
  return (
    <section className="bg-gradient-to-b from-white to-teal-50/50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mb-10 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div><SectionTag>{t("featured.tag")}</SectionTag><h2 className="mr-display mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">{t("featured.title")}</h2></div>
          <Btn variant="ghost" className="px-6 py-3" onClick={() => { setFilters(EMPTY_FILTERS); navigate("listings"); }}>{t("featured.viewAll")} <ArrowRight size={16} /></Btn>
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list.map((p, i) => <PropertyCard key={p.id} p={p} delay={i * 80} />)}</div>
      </div>
    </section>
  );
}

const LANDLORD_BENEFITS = [
  { icon: Users, titleKey: "forLandlords.benefits.reach.title", descKey: "forLandlords.benefits.reach.desc" },
  { icon: TrendingUp, titleKey: "forLandlords.benefits.easy.title", descKey: "forLandlords.benefits.easy.desc" },
  { icon: Eye, titleKey: "forLandlords.benefits.visibility.title", descKey: "forLandlords.benefits.visibility.desc" },
  { icon: BarChart3, titleKey: "forLandlords.benefits.analytics.title", descKey: "forLandlords.benefits.analytics.desc" },
];
function ForLandlords() {
  const { navigate } = useApp();
  const { t } = useTranslation();
  return (
    <section id="agents" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal className="relative">
          <div className="overflow-hidden rounded-[32px] shadow-2xl shadow-teal-900/15 ring-1 ring-black/5"><img loading="lazy" alt={t("forLandlords.title")} src={url("photo-1556157382-97eda2d62296", 800)} className="h-[380px] w-full object-cover lg:h-[460px]" /></div>
          <div className="absolute -bottom-6 right-4 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-gray-100"><div className="text-xs font-medium text-gray-500">{t("forLandlords.responseTime")}</div><div className="mr-display text-2xl font-extrabold text-teal-700">&lt; 2 h</div></div>
        </Reveal>
        <div>
          <Reveal><SectionTag>{t("forLandlords.tag")}</SectionTag></Reveal>
          <Reveal delay={80}><h2 className="mr-display mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">{t("forLandlords.title")}</h2><p className="mt-3 text-gray-600">{t("forLandlords.subtitle")}</p></Reveal>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {LANDLORD_BENEFITS.map((b, i) => (
              <Reveal key={b.titleKey} delay={120 + i * 80}>
                <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-100"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-700 text-white"><b.icon size={18} /></span><div><h3 className="mr-display font-bold text-gray-900">{t(b.titleKey)}</h3><p className="mt-0.5 text-sm text-gray-600">{t(b.descKey)}</p></div></div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={460}><Btn variant="amber" className="mt-7 px-7 py-3.5" onClick={() => navigate("post")}>{t("forLandlords.cta")} <ArrowRight size={18} /></Btn></Reveal>
        </div>
      </div>
    </section>
  );
}

function MansaSend() {
  const { t } = useTranslation();
  return (
    <section id="longuedree" className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
      <Reveal>
        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-gray-900 via-teal-900 to-teal-800 p-8 shadow-2xl lg:p-14">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-500/30 blur-3xl mr-blob" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-teal-400/30 blur-3xl mr-blob" style={{ animationDelay: "5s" }} />
          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 ring-1 ring-white/15"><Sparkles size={14} /> {t("mansaSend.badge")}</span>
              <h2 className="mr-display mt-5 text-3xl font-extrabold text-white sm:text-4xl">{t("mansaSend.title")}</h2>
              <p className="mt-4 max-w-md text-teal-100">{t("mansaSend.subtitle")}</p>
              <div className="mt-6 flex flex-wrap gap-3">{["mansaSend.rentPayment", "mansaSend.secureDeposits", "mansaSend.instantBooking"].map((key) => (<span key={key} className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/15"><Check size={14} className="text-amber-400" /> {t(key)}</span>))}</div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="mr-float w-full max-w-xs rounded-3xl bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between"><span className="mr-display font-extrabold text-gray-900">Mansa<span className="text-amber-500">Send</span></span><span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-700 text-white"><Wallet size={18} /></span></div>
                <div className="mt-5 rounded-2xl bg-gray-50 p-4"><div className="text-xs text-gray-500">{t("mansaSend.rentPayment")}</div><div className="mr-display mt-1 text-3xl font-extrabold text-gray-900">6,2M GNF</div><div className="mt-1 text-xs text-gray-400">Kipé, Conakry · {t("mansaSend.monthly")}</div></div>
                <button className="mt-4 w-full rounded-2xl bg-amber-500 py-3 font-semibold text-white shadow-lg shadow-amber-500/30">{t("mansaSend.paySecurely")}</button>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400"><ShieldCheck size={13} /> {t("mansaSend.protectedTransaction")}</div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const REVIEWS = [
  { name: "Aïssatou Diallo", roleKey: "testimonials.role1", textKey: "testimonials.text1", img: url("photo-1531123897727-8f129e1688ce", 200) },
  { name: "Mamadou Baldé", roleKey: "testimonials.role2", textKey: "testimonials.text2", img: url("photo-1507003211169-0a1dd7228f2d", 200) },
  { name: "Fatoumata Camara", roleKey: "testimonials.role3", textKey: "testimonials.text3", img: url("photo-1438761681033-6461ffad8d80", 200) },
];
function Testimonials() {
  const { t } = useTranslation();
  return (
    <section className="bg-teal-50/60 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mb-10 text-center"><SectionTag>{t("testimonials.tag")}</SectionTag><h2 className="mr-display mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">{t("testimonials.title")}</h2></Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.name} delay={i * 100}>
              <figure className="flex h-full flex-col rounded-3xl bg-white p-7 shadow-sm ring-1 ring-gray-100">
                <div className="flex gap-0.5 text-amber-500">{[...Array(5)].map((_, k) => <Star key={k} size={16} fill="currentColor" />)}</div>
                <blockquote className="mt-4 flex-1 text-gray-700">«&nbsp;{t(r.textKey)}&nbsp;»</blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-5"><img alt={r.name} src={r.img} className="h-11 w-11 rounded-full object-cover ring-2 ring-teal-100" /><div><div className="mr-display font-bold text-gray-900">{r.name}</div><div className="text-xs text-gray-500">{t(r.roleKey)}</div></div></figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  const { route } = useApp();
  useEffect(() => {
    if (route.anchor) {
      const el = document.getElementById(route.anchor);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    }
  }, [route]);
  return (<><Hero /><Categories /><Cities /><HowItWorks /><WhyChoose /><Featured /><ForLandlords /><MansaSend /><Testimonials /></>);
}

const PRICE_OPTS = [
  { label: "any", v: 0 }, { label: "1M GNF", v: 1000000 }, { label: "2M GNF", v: 2000000 },
  { label: "3M GNF", v: 3000000 }, { label: "5M GNF", v: 5000000 }, { label: "8M GNF", v: 8000000 }, { label: "15M GNF", v: 15000000 },
];

function FilterBar() {
  const { filters, setFilters } = useApp();
  const { t } = useTranslation();
  const [openM, setOpenM] = useState(false);
  const set = (patch) => setFilters({ ...filters, ...patch });
  const sel = "mr-sel w-full appearance-none rounded-xl border-0 bg-gray-50 px-3.5 py-2.5 pr-8 text-sm font-medium text-gray-800 ring-1 ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500";
  const Fields = () => (
    <>
      <select className={sel} value={filters.city} onChange={(e) => set({ city: e.target.value })}><option value="">{t("listings.filters.allCities")}</option>{VILLES_KEYS.map((v) => <option key={v} value={v}>{t(`cities.${v}`)}</option>)}</select>
      <select className={sel} value={filters.type} onChange={(e) => set({ type: e.target.value })}><option value="">{t("listings.filters.allTypes")}</option>{TYPES_KEYS.map((v) => <option key={v} value={v}>{t(`types.${v}`)}</option>)}</select>
      <select className={sel} value={filters.rental} onChange={(e) => set({ rental: e.target.value })}><option value="">{t("listings.filters.allRentals")}</option>{LOCATIONS_KEYS.map((v) => <option key={v} value={v}>{t(`rentalTypes.${v}`)}</option>)}</select>
      <select className={sel} value={filters.beds} onChange={(e) => set({ beds: Number(e.target.value) })}><option value={0}>{t("listings.filters.bedrooms")}</option>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}</select>
      <select className={sel} value={filters.minPrice} onChange={(e) => set({ minPrice: Number(e.target.value) })}>{PRICE_OPTS.map((o) => <option key={o.v} value={o.v}>{o.v ? `${t("listings.filters.min")} ${o.label}` : t("listings.filters.minPrice")}</option>)}</select>
      <select className={sel} value={filters.maxPrice} onChange={(e) => set({ maxPrice: Number(e.target.value) })}>{PRICE_OPTS.map((o) => <option key={o.v} value={o.v}>{o.v ? `${t("listings.filters.max")} ${o.label}` : t("listings.filters.maxPrice")}</option>)}</select>
    </>
  );
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={filters.q} onChange={(e) => set({ q: e.target.value })} placeholder={t("listings.filters.searchPlaceholder")} className="w-full rounded-xl border-0 bg-gray-50 py-2.5 pl-10 pr-3 text-sm ring-1 ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <button onClick={() => setOpenM((v) => !v)} className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 lg:hidden"><SlidersHorizontal size={16} /> {t("listings.filters.filters")}</button>
      </div>
      <div className={`mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-6 ${openM ? "grid" : "hidden lg:grid"}`}><Fields /></div>
    </div>
  );
}

function ListingsPage() {
  const { properties, filters, setFilters, navigate } = useApp();
  const { t } = useTranslation();
  const f = filters;
  const filtered = useMemo(() => {
    let list = properties.filter((p) => {
      if (f.city && p.cityKey !== f.city) return false;
      if (f.type && p.type !== f.type) return false;
      if (f.rental && p.rentalTypeKey !== f.rental) return false;
      if (f.beds && p.beds < f.beds) return false;
      if (f.minPrice && p.price < f.minPrice) return false;
      if (f.maxPrice && p.price > f.maxPrice) return false;
      if (f.q) { const q = f.q.toLowerCase(); if (!(p.titleKey.toLowerCase().includes(q) || p.cityKey.toLowerCase().includes(q) || (p.neighborhood || "").toLowerCase().includes(q))) return false; }
      return true;
    });
    if (f.sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (f.sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (f.sort === "new") list = [...list].sort((a, b) => b.id - a.id);
    return list;
  }, [properties, f]);

  return (
    <div className="min-h-screen bg-gray-50/70">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="mr-display text-2xl font-extrabold text-gray-900 sm:text-3xl">{t("listings.title")}</h1>
            <p className="mt-1 text-sm text-gray-500"><span className="font-semibold text-teal-700">{filtered.length}</span> {t("listings.inCity", { city: f.city ? t(`cities.${f.city}`) : t("listings.inGuinea") })}</p>
          </div>
          <select value={f.sort} onChange={(e) => setFilters({ ...f, sort: e.target.value })} className="mr-sel hidden appearance-none rounded-xl border-0 bg-white px-4 py-2.5 pr-9 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 focus:outline-none sm:block">
            <option value="rel">{t("listings.sort.relevance")}</option><option value="price-asc">{t("listings.sort.priceAsc")}</option><option value="price-desc">{t("listings.sort.priceDesc")}</option><option value="new">{t("listings.sort.newest")}</option>
          </select>
        </div>
        <FilterBar />
        {filtered.length === 0 ? (
          <div className="mt-12 flex flex-col items-center rounded-3xl bg-white py-16 text-center ring-1 ring-gray-100">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-gray-100 text-gray-400"><Search size={28} /></span>
            <h3 className="mr-display mt-5 text-xl font-bold text-gray-900">{t("listings.filters.noResults")}</h3>
            <p className="mt-2 max-w-sm text-sm text-gray-500">{t("listings.filters.noResultsHint")}</p>
            <Btn variant="ghost" className="mt-5 px-5 py-2.5" onClick={() => setFilters(EMPTY_FILTERS)}>{t("listings.filters.reset")}</Btn>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((p, i) => <PropertyCard key={p.id} p={p} delay={Math.min(i, 6) * 60} />)}</div>
        )}
        <div className="mt-10 text-center"><Btn variant="ghost" className="px-6 py-3" onClick={() => navigate("home")}><ArrowLeft size={16} /> {t("listings.backHome")}</Btn></div>
      </div>
    </div>
  );
}

function DetailPage() {
  const { route, properties, favorites, toggleFavorite, navigate, back, user, openAuth, startConversation, reviews } = useApp();
  const { t } = useTranslation();
  const p = properties.find((x) => x.id === route.id);
  const gallery = useMemo(() => (p ? galleryOf(p) : []), [p]);
  const [active, setActive] = useState(0);
  useEffect(() => { setActive(0); }, [route.id]);
  if (!p) return <div className="mx-auto max-w-3xl px-5 py-24 text-center"><p className="text-gray-500">{t("detail.notFound")}</p><Btn variant="ghost" className="mt-4 px-5 py-2.5" onClick={() => navigate("listings")}>{t("detail.viewListings")}</Btn></div>;

  const ll = landlordOf(p);
  const fav = favorites.includes(p.id);
  const agentId = agentOf(p);
  const agentReviews = reviews.filter((r) => r.agentId === agentId);
  const agentRating = agentReviews.length ? agentReviews.reduce((s, r) => s + r.rating, 0) / agentReviews.length : 0;
  const contact = () => { if (!user) return openAuth(); const cid = startConversation(p); navigate("messages", { conv: cid }); };
  const similar = properties.filter((x) => x.id !== p.id && (x.type === p.type || x.cityKey === p.cityKey)).slice(0, 3);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8 lg:py-10">
        <button onClick={back} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-teal-700"><ArrowLeft size={16} /> {t("detail.back")}</button>
        <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
          <div className="relative overflow-hidden rounded-3xl bg-gray-100">
            <img alt={t(p.titleKey)} src={gallery[active]} className="h-[280px] w-full object-cover sm:h-[440px]" />
            {p.tagKey && <span className="absolute left-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow">{t(p.tagKey)}</span>}
            <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-teal-700 shadow backdrop-blur"><ShieldCheck size={14} /> {t("detail.verified")}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-2">
            {gallery.slice(0, 4).map((g, i) => (
              <button key={i} onClick={() => setActive(i)} className={`relative h-20 overflow-hidden rounded-2xl ring-2 sm:h-[140px] lg:h-[212px] ${active === i ? "ring-teal-600" : "ring-transparent"}`}>
                <img alt={`${t(p.titleKey)} ${i + 1}`} src={g} className="h-full w-full object-cover" />
                {i === 3 && gallery.length > 4 && <span className="absolute inset-0 grid place-items-center bg-gray-900/50 text-sm font-bold text-white"><Maximize2 size={18} /></span>}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">{t(`types.${p.type}`)} · {t(p.rentalTypeKey)}</span>
                <h1 className="mr-display mt-3 text-3xl font-extrabold text-gray-900">{t(p.titleKey)}</h1>
                <p className="mt-2 flex items-center gap-1.5 text-gray-500"><MapPin size={16} /> {p.neighborhood ? `${p.neighborhood}, ` : ""}{t(p.cityKey)}, {t("detail.inGuinea")}</p>
              </div>
              <button onClick={() => toggleFavorite(p.id)} className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${fav ? "bg-rose-500 text-white" : "bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-rose-300"}`}><Heart size={16} fill={fav ? "currentColor" : "none"} /> {fav ? t("propertyCard.saved") : t("propertyCard.save")}</button>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {[[Bed, t("detail.bedrooms", { count: p.beds, countPlural: p.beds > 1 ? "s" : "" })], [Bath, t("detail.bathrooms", { count: p.baths, countPlural: p.baths > 1 ? "s" : "" })], [Square, t("detail.area", { area: p.area })]].map(([Ic, label], i) => (
                <div key={i} className="flex items-center gap-2 rounded-2xl bg-gray-50 px-4 py-3 ring-1 ring-gray-100"><Ic size={18} className="text-teal-600" /><span className="text-sm font-semibold text-gray-700">{label}</span></div>
              ))}
            </div>
            <div className="mt-8">
              <h2 className="mr-display text-xl font-bold text-gray-900">{t("detail.description")}</h2>
              <p className="mt-3 leading-relaxed text-gray-600">{p.description || t("detail.defaultDescription", { type: t(`types.${p.type}`).toLowerCase(), area: p.area, location: p.neighborhood ? p.neighborhood + ", " : "", beds: p.beds, bedsPlural: p.beds > 1 ? "s" : "", baths: p.baths, bathsPlural: p.baths > 1 ? "s" : "", rentalType: t(p.rentalTypeKey).toLowerCase() })}</p>
            </div>
            {p.amenities && p.amenities.length > 0 && (
              <div className="mt-8">
                <h2 className="mr-display text-xl font-bold text-gray-900">{t("detail.amenities")}</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {p.amenities.map((a) => (<div key={a} className="flex items-center gap-2 text-sm text-gray-700"><span className="grid h-6 w-6 place-items-center rounded-full bg-teal-50 text-teal-700"><Check size={13} strokeWidth={3} /></span>{t(`amenities.${AMEN_KEYS[a]}`)}</div>))}
                </div>
              </div>
            )}
            <div className="mt-8 overflow-hidden rounded-3xl ring-1 ring-gray-100">
              <div className="flex items-center gap-2 bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-700"><MapPin size={16} className="text-teal-600" /> {p.neighborhood ? `${p.neighborhood}, ` : ""}{t(p.cityKey)}</div>
              <img alt={t("detail.mapAlt", { city: t(p.cityKey) })} src={url("photo-1524813686514-a57563d77965", 900)} className="h-48 w-full object-cover" />
            </div>
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
              <div className="text-sm text-gray-500">{t("detail.monthlyRent")}</div>
              <div className="mr-display mt-1 text-3xl font-extrabold text-teal-700">{formatGNF(p.price)}<span className="text-base font-medium text-gray-400">{t("propertyCard.perMonth")}</span></div>
              <button onClick={() => agentId != null && navigate("agent", { id: agentId })} className={`mt-5 flex w-full items-center gap-3 border-t border-gray-100 pt-5 text-left ${agentId != null ? "" : "cursor-default"}`}>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-teal-700 text-sm font-bold text-white">{ll.name.charAt(0)}</span>
                <div className="flex-1">
                  <div className="mr-display font-bold text-gray-900">{ll.name}</div>
                  <div className="flex items-center gap-1 text-xs text-gray-500"><BadgeCheck size={13} className="text-teal-600" /> {agentId != null ? `${t(ll.roleKey)} ${t("detail.verifiedAgent")}` : t("detail.landlordVerified")}</div>
                </div>
                {agentId != null && agentReviews.length > 0 && <Stars value={agentRating} size={14} />}
              </button>
              <Btn variant="solid" className="mt-5 w-full py-3.5" onClick={contact}><MessageSquare size={18} /> {t("detail.sendMessage")}</Btn>
              <a href={`tel:${ll.phone.replace(/\s/g, "")}`} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 font-semibold text-teal-800 ring-1 ring-teal-200 transition hover:bg-teal-50"><Phone size={18} /> {t("detail.call")}</a>
              <div className="mt-4 flex items-center justify-center gap-1.5 rounded-2xl bg-amber-50 py-2.5 text-xs font-medium text-amber-700"><ShieldCheck size={13} /> {t("detail.protectedVisits")}</div>
            </div>
          </aside>
        </div>
        <div className="mt-12 border-t border-gray-100 pt-10"><ReviewsBlock propertyId={p.id} /></div>
        {similar.length > 0 && (
          <div className="mt-14">
            <h2 className="mr-display text-2xl font-extrabold text-gray-900">{t("detail.similar")}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{similar.map((s) => <PropertyCard key={s.id} p={s} />)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

const emptyForm = { title: "", type: "Maison", rentalType: "longStay", city: "Conakry", neighborhood: "", price: "", beds: "1", baths: "1", area: "", description: "", phone: "", image: "" };

function PostPage() {
  const { addProperty, navigate, showToast, user, openAuth } = useApp();
  const { t } = useTranslation();
  const [form, setForm] = useState({ ...emptyForm, phone: user?.phone || "" });
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const inp = "w-full rounded-xl border-0 bg-gray-50 px-4 py-3 text-sm text-gray-800 ring-1 ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500";
  const sel = "mr-sel w-full appearance-none rounded-xl border-0 bg-gray-50 px-4 py-3 pr-9 text-sm text-gray-800 ring-1 ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500";
  const lab = "mb-1.5 block text-sm font-semibold text-gray-700";

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = t("post.errors.title");
    if (!form.price || Number(form.price) <= 0) e.price = t("post.errors.price");
    if (!form.city) e.city = t("post.errors.city");
    if (!form.phone.trim()) e.phone = t("post.errors.phone");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) { showToast(t("post.errorToast")); return; }
    const newP = addProperty({
      titleKey: "seedProperties.p1.title", type: form.type, rentalTypeKey: form.rentalType, cityKey: form.city,
      neighborhood: form.neighborhood.trim(), price: Number(form.price), beds: Number(form.beds),
      baths: Number(form.baths), area: Number(form.area) || 0, description: form.description.trim(),
      images: form.image.trim() ? [form.image.trim()] : imgs(form.type, 1000),
      tagKey: "tags.new", featured: false,
      landlordInfo: { name: user?.name || t("landlordRoles.Propriétaire"), phone: form.phone.trim() },
    });
    showToast(t("post.successToast"));
    navigate("detail", { id: newP.id });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50/70">
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-50 text-teal-700"><User size={28} /></span>
          <h1 className="mr-display mt-5 text-2xl font-extrabold text-gray-900">{t("post.loginTitle")}</h1>
          <p className="mt-2 text-sm text-gray-500">{t("post.loginSubtitle")}</p>
          <Btn variant="solid" className="mt-6 px-6 py-3" onClick={openAuth}>{t("post.createAccount")}</Btn>
        </div>
      </div>
    );
  }
  if (!canPost(user)) {
    return (
      <div className="min-h-screen bg-gray-50/70">
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-50 text-amber-600"><Crown size={28} /></span>
          <h1 className="mr-display mt-5 text-2xl font-extrabold text-gray-900">{t("post.trialEndedTitle")}</h1>
          <p className="mt-2 text-sm text-gray-500">{t("post.trialEndedSubtitle", { price: formatGNF(SUBSCRIPTION_PRICE) })}</p>
          <Btn variant="amber" className="mt-6 px-6 py-3" onClick={() => navigate("subscribe")}>{t("post.subscribe", { price: formatGNF(SUBSCRIPTION_PRICE) })}</Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/70">
      <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8 lg:py-14">
        <button onClick={() => navigate("home")} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-teal-700"><ArrowLeft size={16} /> {t("detail.back")}</button>
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
          <SectionTag>{t("post.tag")}</SectionTag>
          <h1 className="mr-display mt-4 text-3xl font-extrabold text-gray-900">{t("post.title")}</h1>
          <p className="mt-2 text-gray-600">{t("post.subtitle")}</p>
          <TrialBanner />
          <div className="mt-7 space-y-5">
            <div>
              <label className={lab}>{t("post.form.title")} *</label>
              <input className={`${inp} ${errors.title ? "ring-rose-400" : ""}`} placeholder={t("post.form.titlePlaceholder")} value={form.title} onChange={(e) => set("title", e.target.value)} />
              {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title}</p>}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div><label className={lab}>{t("post.form.type")}</label><select className={sel} value={form.type} onChange={(e) => set("type", e.target.value)}>{TYPES_KEYS.map((type) => <option key={type} value={type}>{t(`types.${type}`)}</option>)}</select></div>
              <div><label className={lab}>{t("post.form.rentalType")}</label><select className={sel} value={form.rentalType} onChange={(e) => set("rentalType", e.target.value)}>{LOCATIONS_KEYS.map((rt) => <option key={rt} value={rt}>{t(`rentalTypes.${rt}`)}</option>)}</select></div>
              <div><label className={lab}>{t("post.form.city")} *</label><select className={`${sel} ${errors.city ? "ring-rose-400" : ""}`} value={form.city} onChange={(e) => set("city", e.target.value)}>{VILLES_KEYS.map((v) => <option key={v} value={v}>{t(`cities.${v}`)}</option>)}</select></div>
              <div><label className={lab}>{t("post.form.neighborhood")}</label><input className={inp} placeholder={t("post.form.neighborhoodPlaceholder")} value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} /></div>
            </div>
            <div className="grid gap-5 sm:grid-cols-4">
              <div className="sm:col-span-2"><label className={lab}>{t("post.form.rent")} *</label><input type="number" className={`${inp} ${errors.price ? "ring-rose-400" : ""}`} placeholder={t("post.form.rentPlaceholder")} value={form.price} onChange={(e) => set("price", e.target.value)} />{errors.price && <p className="mt-1 text-xs text-rose-500">{errors.price}</p>}</div>
              <div><label className={lab}>{t("post.form.bedrooms")}</label><select className={sel} value={form.beds} onChange={(e) => set("beds", e.target.value)}>{[0, 1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
              <div><label className={lab}>{t("post.form.bathrooms")}</label><select className={sel} value={form.baths} onChange={(e) => set("baths", e.target.value)}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div><label className={lab}>{t("post.form.area")}</label><input type="number" className={inp} placeholder={t("post.form.areaPlaceholder")} value={form.area} onChange={(e) => set("area", e.target.value)} /></div>
              <div><label className={lab}>{t("post.form.phone")} *</label><input className={`${inp} ${errors.phone ? "ring-rose-400" : ""}`} placeholder={t("post.form.phonePlaceholder")} value={form.phone} onChange={(e) => set("phone", e.target.value)} />{errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}</div>
            </div>
            <div>
              <label className={lab}>{t("post.form.imageUrl")}</label>
              <div className="relative"><ImagePlus size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input className={`${inp} pl-10`} placeholder={t("post.form.imageUrlPlaceholder")} value={form.image} onChange={(e) => set("image", e.target.value)} /></div>
            </div>
            <div><label className={lab}>{t("post.form.description")}</label><textarea rows={4} className={inp} placeholder={t("post.form.descriptionPlaceholder")} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Btn variant="solid" className="flex-1 py-3.5" onClick={submit}><Check size={18} /> {t("post.form.submit")}</Btn>
              <Btn variant="ghost" className="py-3.5 sm:px-6" onClick={() => navigate("home")}>{t("post.form.cancel")}</Btn>
            </div>
            <p className="text-center text-xs text-gray-400">{t("post.form.terms")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FavoritesPage() {
  const { properties, favorites, navigate, setFilters } = useApp();
  const { t } = useTranslation();
  const list = properties.filter((p) => favorites.includes(p.id));
  return (
    <div className="min-h-screen bg-gray-50/70">
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <button onClick={() => navigate("home")} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-teal-700"><ArrowLeft size={16} /> {t("detail.back")}</button>
        <h1 className="mr-display text-2xl font-extrabold text-gray-900 sm:text-3xl">{t("favorites.title")} <Heart className="ml-1 inline text-rose-500" size={22} fill="currentColor" /></h1>
        <p className="mt-1 text-sm text-gray-500">{list.length} {t("favorites.empty")}</p>
        {list.length === 0 ? (
          <div className="mt-12 flex flex-col items-center rounded-3xl bg-white py-16 text-center ring-1 ring-gray-100">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-rose-50 text-rose-400"><Heart size={28} /></span>
            <h3 className="mr-display mt-5 text-xl font-bold text-gray-900">{t("favorites.empty")}</h3>
            <p className="mt-2 max-w-sm text-sm text-gray-500">{t("favorites.emptyHint")}</p>
            <Btn variant="solid" className="mt-5 px-6 py-3" onClick={() => { setFilters(EMPTY_FILTERS); navigate("listings"); }}>{t("favorites.browse")}</Btn>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list.map((p, i) => <PropertyCard key={p.id} p={p} delay={i * 60} />)}</div>
        )}
      </div>
    </div>
  );
}

let gsiPromise = null;
function loadGsi() {
  if (gsiPromise) return gsiPromise;
  gsiPromise = new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.google?.accounts?.id) return resolve(window.google);
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve(window.google);
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return gsiPromise;
}
function decodeJwt(token) {
  try {
    const p = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(atob(p).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
  </svg>
);
function GoogleAuthButton() {
  const { login, showToast } = useApp();
  const { t } = useTranslation();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const ref = useRef(null);
  useEffect(() => {
    if (!clientId || !ref.current) return;
    let cancelled = false;
    loadGsi()
      .then((google) => {
        if (cancelled || !google?.accounts?.id) return;
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (resp) => {
            const data = decodeJwt(resp.credential);
            if (data?.email) login({ name: data.name || data.email.split("@")[0], email: data.email, avatar: data.picture });
            else showToast(t("auth.googleError"));
          },
        });
        ref.current.innerHTML = "";
        google.accounts.id.renderButton(ref.current, { theme: "outline", size: "large", text: "continue_with", shape: "pill", width: 320 });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [clientId, login, showToast]);

  if (clientId) return <div className="flex justify-center" ref={ref} />;
  return (
    <button onClick={() => login({ name: t("auth.demoUser"), email: "demo@gmail.com" })} className="flex w-full items-center justify-center gap-2.5 rounded-full bg-white py-3 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50">
      <GoogleIcon /> {t("auth.continueGoogle")}
    </button>
  );
}

function AuthModal() {
  const { authOpen, closeAuth, login } = useApp();
  const { t } = useTranslation();
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  useEffect(() => { if (authOpen) { setTab("login"); setForm({ name: "", email: "", password: "" }); } }, [authOpen]);
  if (!authOpen) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const inp = "w-full rounded-xl border-0 bg-gray-50 py-3 pl-10 pr-3 text-sm text-gray-800 ring-1 ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500";
  const submit = () => {
    const name = (tab === "register" ? form.name : "") || form.email.split("@")[0] || t("auth.demoUser");
    login({ name, email: form.email });
  };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div onClick={closeAuth} className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        <button onClick={closeAuth} className="absolute right-5 top-5 text-gray-400 hover:text-gray-700"><X size={20} /></button>
        <div className="flex justify-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white"><Home size={22} /></span></div>
        <h2 className="mr-display mt-4 text-center text-2xl font-extrabold text-gray-900">{tab === "login" ? t("auth.loginTitle") : t("auth.registerTitle")}</h2>
        <p className="mt-1 text-center text-sm text-gray-500">{tab === "login" ? t("auth.loginSubtitle") : t("auth.registerSubtitle")}</p>
        <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1">
          {[["login", t("auth.loginTab")], ["register", t("auth.registerTab")]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`rounded-lg py-2 text-sm font-semibold transition ${tab === k ? "bg-white text-teal-700 shadow-sm" : "text-gray-500"}`}>{l}</button>
          ))}
        </div>
        <div className="mt-5"><GoogleAuthButton /></div>
        <div className="my-4 flex items-center gap-3 text-xs font-medium text-gray-400"><span className="h-px flex-1 bg-gray-200" /> {t("auth.orEmail")} <span className="h-px flex-1 bg-gray-200" /></div>
        <div className="space-y-3">
          {tab === "register" && (<div className="relative"><User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input className={inp} placeholder={t("auth.fullName")} value={form.name} onChange={(e) => set("name", e.target.value)} /></div>)}
          <div className="relative"><Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input className={inp} placeholder={t("auth.email")} value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div className="relative"><Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="password" className={inp} placeholder={t("auth.password")} value={form.password} onChange={(e) => set("password", e.target.value)} /></div>
        </div>
        <Btn variant="solid" className="mt-5 w-full py-3.5" onClick={submit}>{tab === "login" ? t("auth.login") : t("auth.register")}</Btn>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-gray-400"><Clock size={12} /> {t("auth.trialNote", { price: formatGNF(SUBSCRIPTION_PRICE) })}</p>
      </div>
    </div>
  );
}

function Stars({ value = 0, size = 16, className = "" }) {
  const full = Math.round(value);
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= full ? "text-amber-500" : "text-gray-300"} fill={i <= full ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

function StarInput({ value, onChange, size = 28 }) {
  const { t } = useTranslation();
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button type="button" key={i} onClick={() => onChange(i)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} className="transition-transform hover:scale-110" aria-label={t("reviews.stars", { count: i, countPlural: i > 1 ? "s" : "" })}>
          <Star size={size} className={(hover || value) >= i ? "text-amber-500" : "text-gray-300"} fill={(hover || value) >= i ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
}

function ReviewsBlock({ propertyId = null, agentId = null }) {
  const { reviews, addReview, user, openAuth } = useApp();
  const { t } = useTranslation();
  const list = useMemo(
    () => reviews.filter((r) => (propertyId != null ? r.propertyId === propertyId : r.agentId === agentId)).sort((a, b) => b.ts - a.ts),
    [reviews, propertyId, agentId]
  );
  const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const submit = () => {
    if (!user) return openAuth();
    if (!rating) return;
    addReview({ propertyId, agentId, rating, text: text.trim() });
    setRating(0);
    setText("");
  };
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="mr-display text-xl font-bold text-gray-900">{t("reviews.title")}</h2>
        {list.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="mr-display text-2xl font-extrabold text-gray-900">{avg.toFixed(1)}</span>
            <Stars value={avg} />
            <span className="text-gray-400">({list.length})</span>
          </div>
        )}
      </div>
      <div className="mt-5 rounded-3xl bg-gray-50 p-5 ring-1 ring-gray-100">
        {user ? (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-semibold text-gray-700">{t("reviews.yourRating")}</span>
              <StarInput value={rating} onChange={setRating} />
            </div>
            <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder={t("reviews.shareExperience")} className="mt-3 w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm text-gray-800 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <div className="mt-3 flex justify-end">
              <Btn variant="solid" className="px-5 py-2.5 text-sm" onClick={submit} disabled={!rating}><Star size={15} /> {t("reviews.publish")}</Btn>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <p className="text-sm text-gray-600">{t("reviews.loginPrompt")}</p>
            <Btn variant="ghost" className="px-5 py-2.5 text-sm" onClick={openAuth}>{t("auth.login")}</Btn>
          </div>
        )}
      </div>
      {list.length > 0 && (
        <div className="mt-5 space-y-4">
          {list.map((r) => (
            <div key={r.id} className="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={r.author} src={r.authorAvatar} size={36} />
                  <div><div className="mr-display font-bold text-gray-900">{r.author}</div><div className="text-xs text-gray-400">{fmtDate(r.ts)}</div></div>
                </div>
                <Stars value={r.rating} />
              </div>
              {r.textKey && <p className="mt-3 text-sm text-gray-600">{t(r.textKey)}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MessagesPage() {
  const { conversations, sendMessage, markConversationRead, route, navigate, user, openAuth } = useApp();
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState(route.conv || conversations[0]?.id || null);
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);
  useEffect(() => { if (route.conv) setActiveId(route.conv); }, [route.conv]);
  const active = conversations.find((c) => c.id === activeId) || null;
  useEffect(() => { if (activeId) markConversationRead(activeId); }, [activeId, conversations.length]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [active?.messages.length]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50/70">
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-50 text-teal-700"><MessageSquare size={28} /></span>
          <h1 className="mr-display mt-5 text-2xl font-extrabold text-gray-900">{t("messages.loginTitle")}</h1>
          <p className="mt-2 text-sm text-gray-500">{t("messages.loginSubtitle")}</p>
          <Btn variant="solid" className="mt-6 px-6 py-3" onClick={openAuth}>{t("messages.loginRegister")}</Btn>
        </div>
      </div>
    );
  }

  const send = () => { if (!draft.trim()) return; sendMessage(activeId, draft); setDraft(""); };

  return (
    <div className="min-h-screen bg-gray-50/70">
      <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-12">
        <h1 className="mr-display text-2xl font-extrabold text-gray-900 sm:text-3xl">{t("messages.title")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("messages.subtitle")}</p>
        {conversations.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-3xl bg-white py-16 text-center ring-1 ring-gray-100">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-teal-50 text-teal-700"><MessageSquare size={28} /></span>
            <h3 className="mr-display mt-5 text-xl font-bold text-gray-900">{t("messages.empty")}</h3>
            <p className="mt-2 max-w-sm text-sm text-gray-500">{t("messages.emptyHint")}</p>
            <Btn variant="solid" className="mt-5 px-6 py-3" onClick={() => navigate("listings")}>{t("messages.browseListings")}</Btn>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-[320px_1fr]">
            <div className="rounded-3xl bg-white p-2 ring-1 ring-gray-100">
              {conversations.map((c) => (
                <button key={c.id} onClick={() => setActiveId(c.id)} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${activeId === c.id ? "bg-teal-50" : "hover:bg-gray-50"}`}>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-teal-700 text-sm font-bold text-white">{c.agentName.charAt(0)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2"><span className="mr-display truncate font-bold text-gray-900">{c.agentName}</span>{c.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500" />}</span>
                    <span className="block truncate text-xs text-gray-500">{c.messages[c.messages.length - 1]?.text}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="flex h-[560px] flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-gray-100">
              {active ? (
                <>
                  <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-teal-700 text-sm font-bold text-white">{active.agentName.charAt(0)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="mr-display font-bold text-gray-900">{active.agentName}</div>
                      <button onClick={() => navigate("detail", { id: active.propertyId })} className="truncate text-xs text-teal-700 hover:underline">{t("messages.about", { title: active.propertyTitle })}</button>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700"><ShieldCheck size={12} /> {t("messages.verified")}</span>
                  </div>
                  <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50/60 px-5 py-5">
                    {active.messages.map((m) => (
                      <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${m.from === "me" ? "bg-teal-700 text-white" : "bg-white text-gray-700 ring-1 ring-gray-100"}`}>{m.text}</div>
                      </div>
                    ))}
                    <div ref={endRef} />
                  </div>
                  <div className="flex items-center gap-2 border-t border-gray-100 p-3">
                    <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={t("messages.typeMessage")} className="flex-1 rounded-full border-0 bg-gray-50 px-4 py-3 text-sm ring-1 ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    <button onClick={send} disabled={!draft.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-teal-700 text-white transition hover:bg-teal-800 disabled:opacity-50" aria-label={t("messages.send")}><Send size={18} /></button>
                  </div>
                </>
              ) : (
                <div className="grid flex-1 place-items-center text-sm text-gray-400">{t("messages.selectConversation")}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const PAY_LABEL = { orange: "payment.orangeMoney", momo: "payment.mtnMoMo", card: "payment.card" };

function PaymentForm({ onSuccess }) {
  const { user, showToast } = useApp();
  const { t } = useTranslation();
  const [method, setMethod] = useState("orange");
  const [processing, setProcessing] = useState(false);
  const [f, setF] = useState({ phone: "", code: "", card: "", exp: "", cvc: "", name: "" });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const inp = "w-full rounded-xl border-0 bg-gray-50 px-4 py-3 text-sm text-gray-800 ring-1 ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500";
  const apiUrl = import.meta.env.VITE_API_URL;
  const real = !!apiUrl;
  const provider = import.meta.env.VITE_PAYMENT_PROVIDER || "cinetpay";

  const valid = (() => {
    if (method === "card") return real ? true : f.card.replace(/\s/g, "").length >= 12 && f.exp.trim() && f.cvc.trim().length >= 3;
    if (f.phone.trim().length < 8) return false;
    if (!real && method === "orange") return f.code.trim().length >= 4;
    return true;
  })();

  const pay = async () => {
    if (!valid || processing) return;
    setProcessing(true);
    if (!real) {
      setTimeout(() => { setProcessing(false); onSuccess(t(PAY_LABEL[method])); }, 1300);
      return;
    }
    try {
      const r = await PaymentAPI.checkout({
        userId: user?.email || "anon",
        provider,
        method,
        phone: f.phone,
        otp: f.code,
        customer: { id: user?.email, name: user?.name, email: user?.email, phone: f.phone },
      });
      if (r.redirectUrl) { window.location.href = r.redirectUrl; return; }
      const ok = await PaymentAPI.poll(r.reference);
      setProcessing(false);
      if (ok) onSuccess(t(PAY_LABEL[method]));
      else showToast(t("payment.notConfirmed"));
    } catch (e) {
      setProcessing(false);
      showToast(t("payment.error", { message: e?.message || "réessayez" }));
    }
  };

  const Tab = ({ id, icon, label }) => (
    <button onClick={() => setMethod(id)} className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-semibold transition ${method === id ? "bg-white text-teal-700 shadow-sm ring-1 ring-teal-200" : "text-gray-500 hover:text-gray-700"}`}>{icon} {label}</button>
  );

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <h3 className="mr-display text-lg font-bold text-gray-900">{t("payment.title")}</h3>
      <div className="mt-4 flex gap-1.5 rounded-2xl bg-gray-100 p-1">
        <Tab id="orange" icon={<Smartphone size={15} />} label={t("payment.orangeMoney")} />
        <Tab id="momo" icon={<Smartphone size={15} />} label={t("payment.mtnMoMo")} />
        <Tab id="card" icon={<CreditCard size={15} />} label={t("payment.card")} />
      </div>
      {method === "orange" && (
        <div className="mt-5 space-y-3">
          <div><label className="mb-1.5 block text-sm font-semibold text-gray-700">{t("payment.orangeLabel")}</label><input className={inp} placeholder="+224 6XX XX XX XX" value={f.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div><label className="mb-1.5 block text-sm font-semibold text-gray-700">{t("payment.confirmationCode")} {real && <span className="font-normal text-gray-400">{t("payment.confirmationCodeHint")}</span>}</label><input className={inp} type="password" placeholder={t("payment.smsCodePlaceholder")} value={f.code} onChange={(e) => set("code", e.target.value)} /></div>
        </div>
      )}
      {method === "momo" && (
        <div className="mt-5 space-y-3">
          <div><label className="mb-1.5 block text-sm font-semibold text-gray-700">{t("payment.momoLabel")}</label><input className={inp} placeholder="+224 6XX XX XX XX" value={f.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-700"><Smartphone size={14} className="mt-0.5 shrink-0" /> {t("payment.momoHint")}</p>
        </div>
      )}
      {method === "card" && (real ? (
        <p className="mt-5 flex items-start gap-2 rounded-xl bg-teal-50 px-3 py-3 text-xs text-teal-700"><Lock size={14} className="mt-0.5 shrink-0" /> {t("payment.cardRedirect")}</p>
      ) : (
        <div className="mt-5 space-y-3">
          <div><label className="mb-1.5 block text-sm font-semibold text-gray-700">{t("payment.cardNumber")}</label><input className={inp} placeholder={t("payment.cardNumberPlaceholder")} value={f.card} onChange={(e) => set("card", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mb-1.5 block text-sm font-semibold text-gray-700">{t("payment.expiration")}</label><input className={inp} placeholder={t("payment.expirationPlaceholder")} value={f.exp} onChange={(e) => set("exp", e.target.value)} /></div>
            <div><label className="mb-1.5 block text-sm font-semibold text-gray-700">{t("payment.cvc")}</label><input className={inp} placeholder={t("payment.cvcPlaceholder")} value={f.cvc} onChange={(e) => set("cvc", e.target.value)} /></div>
          </div>
          <div><label className="mb-1.5 block text-sm font-semibold text-gray-700">{t("payment.nameOnCard")}</label><input className={inp} placeholder={t("payment.nameOnCardPlaceholder")} value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
        </div>
      ))}
      <Btn variant="solid" className="mt-5 w-full py-3.5" onClick={pay} disabled={!valid || processing}>
        {processing ? t("payment.processing") : <>{t("payment.pay", { amount: formatGNF(SUBSCRIPTION_PRICE) })} <ArrowRight size={18} /></>}
      </Btn>
      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400"><Lock size={13} /> {t("payment.secureNote")}</div>
    </div>
  );
}

function SubscribePage() {
  const { user, openAuth, subscribe, navigate } = useApp();
  const { t } = useTranslation();
  const subscribed = isSubscribed(user);
  const trial = inTrial(user);
  const PLAN = ["subscribe.planFeatures.unlimited", "subscribe.planFeatures.verifiedBadge", "subscribe.planFeatures.premiumVisibility", "subscribe.planFeatures.unlimitedMessaging", "subscribe.planFeatures.analytics"];
  return (
    <div className="min-h-screen bg-gray-50/70">
      <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8 lg:py-14">
        <button onClick={() => navigate("home")} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-teal-700"><ArrowLeft size={16} /> {t("detail.back")}</button>
        <SectionTag>{t("subscribe.tag")}</SectionTag>
        <h1 className="mr-display mt-4 text-3xl font-extrabold text-gray-900">{t("subscribe.title")}</h1>
        <p className="mt-2 text-gray-600">{t("subscribe.subtitle", { price: formatGNF(SUBSCRIPTION_PRICE) })}</p>
        {!user ? (
          <div className="mt-7 rounded-3xl bg-white p-6 text-center ring-1 ring-gray-100">
            <p className="text-sm text-gray-600">{t("subscribe.loginPrompt")}</p>
            <Btn variant="solid" className="mt-4 px-6 py-3" onClick={openAuth}>{t("subscribe.createAccount")}</Btn>
          </div>
        ) : subscribed ? (
          <div className="mt-7 flex items-center gap-4 rounded-3xl bg-teal-700 p-6 text-white shadow-lg shadow-teal-700/20">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15"><Crown size={24} /></span>
            <div><div className="mr-display text-lg font-bold">{t("subscribe.active")}</div><div className="text-sm text-teal-100">{t("subscribe.activeUntil", { date: fmtDate(user.subscribedUntil), method: user.payMethod })}</div></div>
          </div>
        ) : (
          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 ring-1 ring-gray-100">
              <div className="flex items-baseline gap-1"><span className="mr-display text-3xl font-extrabold text-teal-700">{formatGNF(SUBSCRIPTION_PRICE)}</span><span className="text-sm text-gray-400">{t("subscribe.perMonth")}</span></div>
              {trial && <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700"><Clock size={12} /> {t("subscribe.trialRemaining", { count: daysLeft(user.trialEndsAt), countPlural: daysLeft(user.trialEndsAt) > 1 ? "s" : "" })}</div>}
              <ul className="mt-5 space-y-2.5">
                {PLAN.map((key) => (<li key={key} className="flex items-start gap-2 text-sm text-gray-700"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal-50 text-teal-700"><Check size={12} strokeWidth={3} /></span>{t(key)}</li>))}
              </ul>
            </div>
            <PaymentForm onSuccess={(m) => subscribe(m)} />
          </div>
        )}
      </div>
    </div>
  );
}

function AgentProfilePage() {
  const { route, properties, navigate, reviews } = useApp();
  const { t } = useTranslation();
  const id = route.id;
  const agent = LANDLORDS[id];
  const listings = properties.filter((p) => agentOf(p) === id);
  const agentReviews = reviews.filter((r) => r.agentId === id);
  const avg = agentReviews.length ? agentReviews.reduce((s, r) => s + r.rating, 0) / agentReviews.length : 0;
  if (!agent) return <div className="mx-auto max-w-2xl px-5 py-24 text-center text-gray-500">{t("agent.notFound")}</div>;
  return (
    <div className="min-h-screen bg-gray-50/70">
      <div className="mx-auto max-w-5xl px-5 py-8 lg:px-8 lg:py-12">
        <button onClick={() => navigate("listings")} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-teal-700"><ArrowLeft size={16} /> {t("detail.back")}</button>
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-teal-600 to-teal-800 text-2xl font-extrabold text-white">{agent.name.charAt(0)}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2"><h1 className="mr-display text-2xl font-extrabold text-gray-900">{agent.name}</h1><BadgeCheck size={20} className="text-teal-600" /></div>
              <p className="mt-1 text-sm text-gray-500">{t(agent.roleKey)} · {t(agent.cityKey)} · {t("agent.memberSince", { year: agent.since })}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-2"><Stars value={avg} /> <span className="text-sm font-semibold text-gray-700">{avg ? avg.toFixed(1) : "—"}</span> <span className="text-sm text-gray-400">({agentReviews.length} {t("agent.reviews")})</span></span>
                <span className="text-gray-300">·</span>
                <span className="text-sm font-semibold text-teal-700">{listings.length} {t("agent.listings", { countPlural: listings.length > 1 ? "s" : "" })}</span>
              </div>
              {agent.bioKey && <p className="mt-3 max-w-xl text-sm text-gray-600">{t(agent.bioKey)}</p>}
            </div>
          </div>
        </div>
        {listings.length > 0 && (
          <div className="mt-8">
            <h2 className="mr-display text-xl font-bold text-gray-900">{t("agent.listingsTitle")}</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{listings.map((p, i) => <PropertyCard key={p.id} p={p} delay={i * 60} />)}</div>
          </div>
        )}
        <div className="mt-10"><ReviewsBlock agentId={id} /></div>
      </div>
    </div>
  );
}

function TrialBanner() {
  const { user, navigate } = useApp();
  const { t } = useTranslation();
  if (!user) return null;
  if (isSubscribed(user))
    return (
      <div className="mt-5 flex items-center gap-2 rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700 ring-1 ring-teal-100"><Crown size={16} /> {t("trialBanner.active")}</div>
    );
  const d = daysLeft(user.trialEndsAt);
  return (
    <div className="mt-5 flex flex-col gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200 sm:flex-row sm:items-center sm:justify-between">
      <span className="flex items-center gap-2 font-semibold"><Clock size={16} /> {t("trialBanner.remaining", { count: d, countPlural: d > 1 ? "s" : "", price: formatGNF(SUBSCRIPTION_PRICE) })}</span>
      <button onClick={() => navigate("subscribe")} className="font-bold text-teal-700 hover:underline">{t("trialBanner.manage")}</button>
    </div>
  );
}

function Footer() {
  const { navigate, setFilters } = useApp();
  const { t } = useTranslation();
  const cols = [
    { h: t("footer.company"), links: [["footer.companyLinks.about", () => navigate("home", { anchor: "apropos" })], ["footer.companyLinks.contact", () => navigate("home", { anchor: "contact" })], ["footer.companyLinks.agents", () => navigate("home", { anchor: "agents" })], ["footer.companyLinks.publish", () => navigate("post")], ["footer.companyLinks.subscription", () => navigate("subscribe")]] },
    { h: t("footer.tenants"), links: [["footer.tenantsLinks.search", () => { setFilters(EMPTY_FILTERS); navigate("listings"); }], ["footer.tenantsLinks.shortStay", () => { setFilters({ ...EMPTY_FILTERS, rental: "shortStay" }); navigate("listings"); }], ["footer.tenantsLinks.longStay", () => { setFilters({ ...EMPTY_FILTERS, rental: "longStay" }); navigate("listings"); }], ["footer.tenantsLinks.messages", () => navigate("messages")], ["footer.tenantsLinks.favorites", () => navigate("favorites")]] },
    { h: t("footer.legal"), links: [["footer.legalLinks.terms", () => {}], ["footer.legalLinks.privacy", () => {}], ["footer.legalLinks.cookies", () => {}], ["footer.legalLinks.trust", () => {}]] },
  ];
  const socials = [{ Icon: Facebook, label: t("footer.social.facebook") }, { Icon: Instagram, label: t("footer.social.instagram") }, { Icon: TikTok, label: t("footer.social.tiktok") }];
  return (
    <footer id="contact" className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo light />
            <p className="mt-4 max-w-xs text-sm text-gray-400">{t("footer.description")}</p>
            <p className="mr-display mt-4 text-sm font-bold uppercase tracking-[0.2em] text-amber-500">{t("footer.slogan")}</p>
            <button onClick={() => { setFilters(EMPTY_FILTERS); navigate("listings"); }} className="mt-5 inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"><Search size={16} /> {t("footer.browseListings")}</button>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <h4 className="mr-display font-bold text-white">{c.h}</h4>
              <ul className="mt-4 space-y-2.5">{c.links.map(([key, fn]) => (<li key={key}><button onClick={fn} className="text-sm text-gray-400 transition hover:text-amber-400">{t(key)}</button></li>))}</ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-7 sm:flex-row">
          <p className="text-sm text-gray-500">{t("footer.rights")}</p>
          <div className="flex gap-3">{socials.map(({ Icon, label }) => (<a key={label} href="#" aria-label={label} className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-gray-300 transition hover:bg-teal-600 hover:text-white"><Icon size={18} /></a>))}</div>
        </div>
      </div>
    </footer>
  );
}

const TikTok = (props) => (<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...props}><path d="M16.6 5.82a4.28 4.28 0 0 1-1.06-2.82h-3.2v12.8a2.33 2.33 0 1 1-2.33-2.33c.24 0 .47.04.69.1V8.3a5.6 5.6 0 0 0-.69-.04 5.55 5.55 0 1 0 5.55 5.55V8.6a7.5 7.5 0 0 0 4.34 1.39V6.8a4.28 4.28 0 0 1-3.3-.98z" /></svg>);

export default function MansaRent() {
  const { t, i18n } = useTranslation();
  const [history, setHistory] = useState([{ name: "home" }]);
  const route = history[history.length - 1];
  const [properties, setProperties] = useState(SEED_PROPERTIES);
  const [favorites, setFavorites] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [reviews, setReviews] = useState(SEED_REVIEWS);
  const toastTimer = useRef(null);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.title = i18n.language === "fr"
      ? "MansaRent � Trouvez. Louez. Emm�nagez. | Location immobili�re en Guin�e"
      : "MansaRent � Find. Rent. Move in. | Real estate rentals in Guinea";
    const meta = document.querySelector('meta[name="description"]') || document.createElement("meta");
    meta.name = "description";
    meta.content = i18n.language === "fr"
      ? "MansaRent est la marketplace de location immobili�re en Guin�e : maisons, appartements, chambres, villas, bureaux et logements de courte dur�e."
      : "MansaRent is the rental marketplace in Guinea: houses, apartments, rooms, villas, offices and short-term rentals.";
    document.head.appendChild(meta);
  }, [i18n.language]);

  const navigate = (name, params = {}) => { setHistory((h) => [...h, { name, ...params }]); window.scrollTo({ top: 0, behavior: "auto" }); };
  const back = () => { setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h)); window.scrollTo({ top: 0 }); };
  const toggleFavorite = (id) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const showToast = (msg) => { setToast(msg); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 3200); };
  const addProperty = (data) => {
    const id = Math.max(0, ...properties.map((p) => p.id)) + 1;
    const prop = { ...data, id, landlordInfo: data.landlordInfo };
    setProperties((arr) => [prop, ...arr]);
    return prop;
  };
  const login = (u) => {
    setUser({ ...u, trialEndsAt: u.trialEndsAt ?? Date.now() + TRIAL_DAYS * DAY, subscribedUntil: u.subscribedUntil ?? null });
    setAuthOpen(false);
    showToast(t("toast.welcome", { name: u.name }));
  };
  const logout = () => { setUser(null); showToast(t("toast.loggedOut")); };

  const startConversation = (p) => {
    const id = "conv-" + p.id;
    setConversations((cs) => {
      if (cs.some((c) => c.id === id)) return cs;
      const agent = landlordOf(p);
      const greeting = { id: "m0", from: "agent", text: t("chat.greeting", { title: p.titleKey, name: agent.name }), ts: Date.now() };
      return [{ id, propertyId: p.id, propertyTitle: p.titleKey, agentId: agentOf(p), agentName: agent.name, messages: [greeting], unread: false }, ...cs];
    });
    return id;
  };
  const sendMessage = (convId, text) => {
    const txt = (text || "").trim();
    if (!txt) return;
    setConversations((cs) => cs.map((c) => c.id === convId ? { ...c, unread: false, messages: [...c.messages, { id: "m" + Date.now(), from: "me", text: txt, ts: Date.now() }] } : c));
    setTimeout(() => {
      setConversations((cs) => cs.map((c) => c.id === convId ? { ...c, unread: true, messages: [...c.messages, { id: "r" + Date.now(), from: "agent", text: t("chat.autoReply"), ts: Date.now() }] } : c));
    }, 1100);
  };
  const markConversationRead = (id) => setConversations((cs) => (cs.some((c) => c.id === id && c.unread) ? cs.map((c) => (c.id === id ? { ...c, unread: false } : c)) : cs));

  const addReview = ({ propertyId = null, agentId = null, rating, text }) => {
    setReviews((rs) => [{ id: "rv" + Date.now(), propertyId, agentId, author: user?.name || t("toast.client"), authorAvatar: user?.avatar || null, rating, text: text || "", ts: Date.now() }, ...rs]);
    showToast(t("toast.reviewAdded"));
  };
  const subscribe = (method) => {
    setUser((u) => (u ? { ...u, subscribedUntil: Date.now() + 30 * DAY, plan: "Pro", payMethod: method } : u));
    showToast(t("toast.subscribed"));
  };

  const ctx = {
    route, navigate, back,
    properties, addProperty,
    favorites, toggleFavorite,
    filters, setFilters,
    user, login, logout,
    authOpen, openAuth: () => setAuthOpen(true), closeAuth: () => setAuthOpen(false),
    toast, showToast,
    conversations, startConversation, sendMessage, markConversationRead,
    reviews, addReview, subscribe,
    i18n,
  };

  let page;
  if (route.name === "listings") page = <ListingsPage />;
  else if (route.name === "detail") page = <DetailPage />;
  else if (route.name === "post") page = <PostPage />;
  else if (route.name === "favorites") page = <FavoritesPage />;
  else if (route.name === "messages") page = <MessagesPage />;
  else if (route.name === "subscribe") page = <SubscribePage />;
  else if (route.name === "agent") page = <AgentProfilePage />;
  else page = <HomePage />;

  return (
    <AppCtx.Provider value={ctx}>
      <div className="mr-root min-h-screen bg-white text-gray-900">
        <GlobalStyles />
        <Navbar />
        <main>{page}</main>
        <Footer />
        <AuthModal />
        <Toast />
      </div>
    </AppCtx.Provider>
  );
}
