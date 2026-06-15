import { useState, useMemo, useEffect } from "react";

// ================================================================
//  SECTION A · YOUR SETTINGS (Secured with Environment Variables)
// ================================================================
const IDOL_NAME      = "안유진 · An Yujin";

// The app now looks at your hidden .env file for these values.
// If it can't find them, it defaults to empty strings to prevent crashes.
const SUPABASE_URL   = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY   = import.meta.env.VITE_SUPABASE_KEY || "";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "";

// ================================================================
//  SECTION B · CATEGORIES & PLATFORMS
// ================================================================
const CATEGORIES = [
  { id: "all",       label: "All",          color: "#E2E2E2", dot: "#444455" },
  { id: "music",     label: "Music",         color: "#C084FC", dot: "#A855F7" },
  { id: "concert",   label: "Concert / FM",  color: "#F87171", dot: "#EF4444" },
  { id: "reality",   label: "Reality / TV",  color: "#34D399", dot: "#10B981" },
  { id: "cf",        label: "CF / Brand",    color: "#FBBF24", dot: "#F59E0B" },
  { id: "group",     label: "Group",         color: "#60A5FA", dot: "#3B82F6" },
  { id: "social",    label: "Social",        color: "#F472B6", dot: "#EC4899" },
  { id: "interview", label: "Interview",     color: "#A3E635", dot: "#84CC16" },
];

const PLATFORMS = {
  youtube:   { label: "YouTube",    color: "#FF5555", bg: "rgba(255,85,85,0.12)"  },
  twitter:   { label: "Twitter/X",  color: "#60C4F0", bg: "rgba(96,196,240,0.12)" },
  instagram: { label: "Instagram",  color: "#F070A0", bg: "rgba(240,112,160,0.12)"},
  tiktok:    { label: "TikTok",     color: "#25F4EE", bg: "rgba(37,244,238,0.12)" },
  bubble:    { label: "Bubble",     color: "#5BE4B4", bg: "rgba(91,228,180,0.12)" },
};
const PLATFORM_KEYS = Object.keys(PLATFORMS);

// ================================================================
//  SECTION C · DEMO DATA
// ================================================================
const DEMO_DATA = [
  { 
    id:1, date:"2025-02-28", title:"IVE – 'Accendio' MV", category:"music", era:"Accendio", 
    description:"Title track MV from IVE's 2nd full album 'Accendio'. Yujin center scenes went viral immediately.", 
    platforms:[{type:"youtube",url:"https://www.youtube.com/watch?v=3",label:"MV"}], 
    media: ["https://i.pinimg.com/736x/43/ba/0a/43ba0a9d94fa2bfe2c3498be60e70417.jpg"],  
    tags:["MV","Accendio","IVE","title track"] 
  },
  { 
    id:2, date:"2025-02-20", title:"Accendio Showcase – Yujin Focus", category:"music", era:"Accendio", 
    description:"IVE 2nd full album showcase. Yujin's speech went viral.", 
    platforms:[{type:"youtube",url:"#",label:"Showcase VOD"}], 
    media: ["https://i.pinimg.com/736x/3b/bc/2a/3bbc2a84d8521bc142ab4c88a834b123.jpg"], 
    tags:["showcase","speech"] 
  },
];

// ================================================================
//  SECTION D · SUPABASE HELPERS & UPLOAD
// ================================================================
const IS_DEMO = !SUPABASE_URL || SUPABASE_URL.includes("YOUR_PROJECT_ID");

async function fetchEntries() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/entries?select=*&order=date.desc`, { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } });
  if (!res.ok) throw new Error(`Database error: ${res.status}`);
  return res.json();
}

async function saveEntry(entry, editId = null) {
  const isEdit = editId !== null;
  const url = isEdit ? `${SUPABASE_URL}/rest/v1/entries?id=eq.${editId}` : `${SUPABASE_URL}/rest/v1/entries`;
  const res = await fetch(url, {
    method: isEdit ? "PATCH" : "POST",
    headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error(`Could not save: ${res.status}`);
  return res.json();
}

async function deleteEntryFromDb(id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/entries?id=eq.${id}`, { method: "DELETE", headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } });
  if (!res.ok) throw new Error(`Could not delete: ${res.status}`);
}

async function uploadMediaFile(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/archive-media/${fileName}`, {
    method: "POST",
    headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error("Failed to upload file");
  return `${SUPABASE_URL}/storage/v1/object/public/archive-media/${fileName}`;
}

// ================================================================
//  SECTION E · SMALL HELPER FUNCTIONS
// ================================================================
const MONTH_NAMES = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Logic to extract thumbnail URLs for various platforms
// ================================================================
//  REPLACEMENT: SECTION E & F (Thumbnail & Grid Logic)
// ================================================================

function getSocialThumbnail(url) {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtu\.be\/|v\/|watch\?v=)([^#\&\?]*)/);
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`;
  
  // Platform Icons (Visual Placeholders)
  if (url.includes('twitter.com') || url.includes('x.com')) return "https://abs.twimg.com/icons/apple-touch-icon-192x192.png";
  if (url.includes('tiktok.com')) return "https://sf16-website-login.neutral.pstatp.com/obj/eden-va2/630440050/tiktok_logo.png";
  if (url.includes('instagram.com')) return "https://static.cdninstagram.com/rsrc.php/v3/yI/r/VsNE-OHk_8a.png";
  if (url.includes('xiaohongshu') || url.includes('rednote')) return "https://s1.xiaohongshu.com/static/logo.png";
  
  return null;
}

function getCat(id) { return CATEGORIES.find(c => c.id === id) || CATEGORIES[1]; }
function niceDate(d) {
  if (!d) return "";
  const parts = d.split("-");
  if (parts.length !== 3) return d;
  return `${parseInt(parts[2], 10)} ${MONTH_NAMES[parseInt(parts[1], 10)]} ${parts[0]}`;
}
function groupByMonth(entries) {
  const map = {};
  entries.forEach(e => {
    if (!e.date) return;
    const key = e.date.slice(0,7); 
    if (!map[key]) map[key] = [];
    map[key].push(e);
  });
  return Object.entries(map).sort(([a],[b]) => b.localeCompare(a)) 
    .map(([key, list]) => ({ year:key.slice(0,4), month:key.slice(5,7), entries:list }));
}

// ================================================================
//  SECTION F · UNIVERSAL MEDIA GRID + SCROLLABLE ALBUM OVERLAY
// ================================================================
const MediaGrid = ({ mediaUrls }) => {
  const [showAlbum, setShowAlbum] = useState(false);

  useEffect(() => {
    document.body.style.overflow = showAlbum ? "hidden" : "unset";
  }, [showAlbum]);

  if (!mediaUrls || mediaUrls.length === 0 || mediaUrls[0] === "") return null;

  return (
    <div style={{ marginTop: 14, marginBottom: 6 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {mediaUrls.slice(0, 3).map((url, index) => {
          const isLastVisible = index === 2;
          const remainingCount = mediaUrls.length - 3;
          const thumb = getSocialThumbnail(url);

          return (
            <div key={index} onClick={(e) => { e.stopPropagation(); setShowAlbum(true); }}
              style={{ 
                position: "relative", aspectRatio: "1 / 1", borderRadius: 8, overflow: "hidden", 
                cursor: "pointer", border: "1px solid #202035", background: "#0a0a0f",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
              
              {/* Prioritize Thumbnail/Logo, fallback to pure color block */}
              {thumb ? (
                <div style={{ 
                  width: "100%", height: "100%", 
                  backgroundImage: `url(${thumb})`, 
                  backgroundSize: thumb.includes('youtube') ? "cover" : "50%", 
                  backgroundPosition: "center", backgroundRepeat: "no-repeat" 
                }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "#1a1a2e" }} />
              )}

              {isLastVisible && remainingCount > 0 && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 16, color: "#A78BFA", fontWeight: "bold" }}>+{remainingCount}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Album Modal - Keeps previous code structure */}
      {showAlbum && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(6,6,12,0.97)", padding: "80px 20px 40px", backdropFilter: "blur(15px)", overflowY: "auto" }} onClick={() => setShowAlbum(false)}>
           <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 60, background: "rgba(6,6,12,0.8)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: "1px solid #1E1E30", zIndex: 120 }}>
             <span style={{ fontSize: 14, color: "#A78BFA" }}>Collection ({mediaUrls.length})</span>
             <button onClick={() => setShowAlbum(false)} style={{ background: "#1F1F35", border: "none", color: "#FFF", borderRadius: "50%", width: 32, height: 32 }}>×</button>
           </div>
           <div style={{ maxWidth: 800, margin: "0 auto", display: "grid", gap: 20 }}>
             {mediaUrls.map((url, i) => (
                <div key={i} style={{ width: "100%", background: "#000", padding: 10, borderRadius: 12 }}>
                   {/* Simplified embed rendering */}
                   {url.includes("youtube") ? (
                      <iframe src={`https://www.youtube.com/embed/${url.split('v=')[1]}`} style={{ width: "100%", height: 400, border: "none" }} allowFullScreen />
                   ) : (
                      <img src={url} style={{ width: "100%", borderRadius: 8 }} />
                   )}
                </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};
  // FORCE SCROLL LOCK: Prevents the background page from moving when album is open
  useEffect(() => {
    if (showAlbum) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [showAlbum]);

  if (!mediaUrls || mediaUrls.length === 0 || mediaUrls[0] === "") return null;

const getYouTubeId = (url) => {
    const match = url.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*)/);
    return (match && match[1].length === 11) ? match[1] : null;
  };

  const renderPreview = (url) => {
    const ytId = getYouTubeId(url);
    const thumb = getSocialThumbnail(url);
    
    if (ytId) return <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
    if (thumb) return <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0f", backgroundImage: `url(${thumb})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} />;
    return <img src={url.trim()} alt="Archive" style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  };

  return (
    <div style={{ marginTop: 14, marginBottom: 6 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {mediaUrls.slice(0, 3).map((url, index) => {
          const isLastVisible = index === 2;
          const remainingCount = mediaUrls.length - 3;
          return (
            <div key={index} onClick={() => setShowAlbum(true)} style={{ position: "relative", aspectRatio: "1 / 1", background: "#121225", borderRadius: 8, overflow: "hidden", cursor: "pointer" }}>
              {renderPreview(url)}
              {isLastVisible && remainingCount > 0 && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 18, color: "#A78BFA" }}>+{remainingCount}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* ... (Album modal remains same as previous code) */}
    </div>
  );
};

      {/* FULL SCROLLABLE ALBUM MODAL */}
      {showAlbum && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", background: "rgba(6,6,12,0.97)", padding: "80px 20px 40px", backdropFilter: "blur(15px)", overflowY: "auto" }} onClick={() => setShowAlbum(false)}>
          
          {/* Fixed Close Header Control */}
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 60, background: "rgba(6,6,12,0.8)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: "1px solid #1E1E30", zIndex: 120, backdropFilter: "blur(10px)" }} onClick={(e) => e.stopPropagation()}>
            <span style={{ fontSize: 14, color: "#A78BFA", fontWeight: 700 }}>Collection ({mediaUrls.length} items)</span>
            <button style={{ background: "#1F1F35", border: "none", color: "#E4E4F4", width: 36, height: 36, borderRadius: "50%", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }} onClick={() => setShowAlbum(false)}>×</button>
          </div>

          {/* Scrollable Grid Layout Wrapper */}
          <div style={{ width: "100%", maxWidth: 1000, display: "grid", gridTemplateColumns: mediaUrls.length === 1 ? "1fr" : "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }} onClick={(e) => e.stopPropagation()}>
            {mediaUrls.map((url, index) => {
              const isSocial = getInstagramId(url) || getTikTokId(url) || getTwitterId(url);
              return (
                <div key={index} style={{ background: "#000", border: "1px solid #1E1E30", borderRadius: 12, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", height: isSocial ? 540 : 300, boxShadow: "0 12px 36px rgba(0,0,0,0.6)" }}>
                  {renderMediaItem(url)}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ================================================================
//  SECTION G · MAIN COMPONENT
// ================================================================
export default function KpopArchive() {
  const [view, setView] = useState("archive"); 
  const [entries, setEntries]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [activeCat, setActiveCat]     = useState("all");
  const [search, setSearch]           = useState("");
  const [filterYear, setFilterYear]   = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [expandedId, setExpandedId]   = useState(null);

  const [unlocked, setUnlocked]       = useState(false);
  const [pwInput, setPwInput]         = useState("");
  const [pwError, setPwError]         = useState(false);

  const [saving, setSaving]           = useState(false);
  const [saveOk, setSaveOk]           = useState(false);
  const [saveError, setSaveError]     = useState(null);
  const [editingId, setEditingId]     = useState(null);

  const BLANK = { title:"", date:"", category:"music", era:"", description:"", tags:"", platforms:[{ type:"youtube", url:"", label:"" }], media: "" };
  const [form, setForm] = useState(BLANK);

  useEffect(() => {
    if (IS_DEMO) {
      setEntries(DEMO_DATA);
      setLoading(false);
    } else {
      fetchEntries()
        .then(data => { setEntries(data); setLoading(false); })
        .catch(e  => { setLoadError(e.message); setLoading(false); });
    }
  }, []);

  // ADVANCED SEARCH
  const filtered = useMemo(() => entries.filter(e => {
    const matchCat   = activeCat === "all" || e.category === activeCat;
    const matchYear  = filterYear === "all" || (e.date && e.date.startsWith(filterYear));
    const matchMonth = filterMonth === "all" || (e.date && e.date.split("-")[1] === filterMonth);
    const q          = search.toLowerCase().trim();
    
    const matchText  = !q ||
      e.title.toLowerCase().includes(q) ||
      (e.description||"").toLowerCase().includes(q) ||
      (e.era||"").toLowerCase().includes(q) ||
      (e.tags||[]).some(t => t.toLowerCase().includes(q));
      
    return matchCat && matchYear && matchMonth && matchText;
  }), [entries, activeCat, search, filterYear, filterMonth]);

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);

  function tryUnlock() {
    if (pwInput === ADMIN_PASSWORD) { setUnlocked(true); setPwError(false); }
    else setPwError(true);
  }

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); }
  function setPlatform(i, field, val) {
    setForm(f => {
      const p = [...f.platforms];
      p[i] = { ...p[i], [field]: val };
      return { ...f, platforms: p };
    });
  }

  function triggerEdit(entry) {
    setEditingId(entry.id);
    setForm({
      title: entry.title || "", date: entry.date || "", category: entry.category || "music",
      era: entry.era || "", description: entry.description || "", tags: (entry.tags || []).join(", "),
      media: (entry.media || []).join(", "),
      platforms: (entry.platforms && entry.platforms.length > 0) ? entry.platforms : [{ type:"youtube", url:"", label:"" }]
    });
    setView("admin");
  }

  async function triggerDelete(e, id) {
    e.stopPropagation();
    if (!window.confirm("Are you completely sure you want to delete this entry? This action cannot be undone.")) return;
    try {
      if (IS_DEMO) setEntries(prev => prev.filter(item => item.id !== id));
      else {
        await deleteEntryFromDb(id);
        setEntries(prev => prev.filter(item => item.id !== id));
      }
      if (expandedId === id) setExpandedId(null);
    } catch(err) { alert(`Delete operation failed: ${err.message}`); }
  }

  async function handleSave() {
    if (!form.title || !form.date) return;
    setSaving(true); setSaveError(null);

    const entry = {
      title:       form.title.trim(),
      date:        form.date,
      category:    form.category,
      era:         form.era.trim(),
      description: form.description.trim(),
      tags:        form.tags.split(",").map(t => t.trim()).filter(Boolean),
      platforms:   form.platforms.filter(p => p.url.trim()),
      media:       form.media.split(",").map(m => m.trim()).filter(Boolean)
    };

    try {
      if (IS_DEMO) {
        if (editingId) {
          setEntries(prev => prev.map(item => item.id === editingId ? { ...entry, id: editingId } : item).sort((a,b) => b.date.localeCompare(a.date)));
        } else {
          setEntries(prev => [{ ...entry, id: Date.now() }, ...prev].sort((a,b) => b.date.localeCompare(a.date)));
        }
      } else {
        const [saved] = await saveEntry(entry, editingId);
        if (editingId) setEntries(prev => prev.map(item => item.id === editingId ? saved : item).sort((a,b) => b.date.localeCompare(a.date)));
        else setEntries(prev => [saved, ...prev].sort((a,b) => b.date.localeCompare(a.date)));
      }
      setForm(BLANK); setEditingId(null); setSaveOk(true);
      setTimeout(() => setSaveOk(false), 4000);
    } catch(e) { setSaveError(e.message); }
    setSaving(false);
  }

  const inp  = { width:"100%", boxSizing:"border-box", background:"#13131F", border:"1px solid #222235", borderRadius:8, padding:"8px 12px", color:"#C8C8E8", fontSize:13, outline:"none" };
  const lbl  = { fontSize:10, color:"#50508A", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:5, fontWeight:700 };
  const btn  = (active) => ({ padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, background: active ? "#A78BFA" : "#13131F", color: active ? "#0A0A0F" : "#50508A" });

  return (
    <div style={{ minHeight:"100vh", background:"#08080F", color:"#E4E4F4", fontFamily:"sans-serif", fontSize:14 }}>

      {/* HEADER & FILTERS */}
      <div style={{ borderBottom:"1px solid #18182A", padding:"16px 22px 12px", position:"sticky", top:0, zIndex:10, background:"rgba(8,8,15,0.96)", backdropFilter:"blur(14px)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div>
            {IS_DEMO && (
              <div style={{ fontSize:10, color:"#FBBF24", background:"rgba(251,191,36,0.08)", border:"1px solid rgba(251,191,36,0.2)", padding:"2px 8px", borderRadius:4, display:"inline-block", marginBottom:5 }}>
                DEMO MODE · Connect Supabase strings in your .env file
              </div>
            )}
            <div style={{ fontSize:10, letterSpacing:"0.14em", color:"#40405A", textTransform:"uppercase", marginBottom:2 }}>Media Archive</div>
            <div style={{ fontSize:17, fontWeight:700, color:"#EDEDFF", letterSpacing:"-0.02em" }}>{IDOL_NAME}</div>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={()=>setView("archive")} style={{ ...btn(view==="archive"), border:"1px solid " + (view==="archive" ? "#38386A":"#18182A") }}>◈ Archive</button>
            <button onClick={()=>setView("admin")}   style={{ ...btn(view==="admin"),   border:"1px solid " + (view==="admin"   ? "#38386A":"#18182A") }}>⚙ Admin</button>
          </div>
        </div>

        {view === "archive" && <>
          {/* ADVANCED SEARCH INPUT */}
          <div style={{ position:"relative", marginBottom:10 }}>
            <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#30305A", fontSize:15 }}>⌕</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search titles, descriptions, tags, eras…" style={{ ...inp, paddingLeft:30 }} />
            {search && <button onClick={()=>setSearch("")} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#505080", cursor:"pointer", fontSize:16 }}>×</button>}
          </div>

          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {CATEGORIES.map(cat => {
              const on = activeCat === cat.id;
              return (
                <button key={cat.id} onClick={()=>setActiveCat(cat.id)} style={{
                  padding:"3px 10px", borderRadius:20, border:"none", cursor:"pointer",
                  fontSize:11, fontWeight:700, letterSpacing:"0.04em",
                  background: on ? cat.color : "transparent", color: on ? "#0A0A0F" : cat.color,
                  outline: on ? "none" : `1px solid ${cat.color}44`, transition:"all 0.12s",
                }}>{cat.label}</button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ ...inp, width: "auto", padding: "6px 12px", fontSize: 12, background: "rgba(20,20,35,0.6)", borderRadius: 20, cursor: "pointer", color: filterYear === "all" ? "#A0A0C0" : "#A78BFA", border: filterYear === "all" ? "1px solid #222235" : "1px solid #A78BFA" }}>
              <option value="all">All Years</option>
              {Array.from({length: new Date().getFullYear() - 2018 + 1}, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y.toString()}>{y}</option>)}
            </select>
            <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ ...inp, width: "auto", padding: "6px 12px", fontSize: 12, background: "rgba(20,20,35,0.6)", borderRadius: 20, cursor: "pointer", color: filterMonth === "all" ? "#A0A0C0" : "#A78BFA", border: filterMonth === "all" ? "1px solid #222235" : "1px solid #A78BFA" }}>
              <option value="all">All Months</option>
              {MONTH_NAMES.map((m, i) => i !== 0 && <option key={i} value={i.toString().padStart(2, '0')}>{m}</option>)}
            </select>
          </div>
        </>}
      </div>

      {/* ARCHIVE VIEW */}
      {view === "archive" && (
        <div style={{ maxWidth:740, margin:"0 auto", padding:"22px 18px 60px" }}>
          {loading   && <div style={{ textAlign:"center", padding:60, color:"#40405A" }}>Loading…</div>}
          {loadError && <div style={{ textAlign:"center", padding:60, color:"#F87171" }}>{loadError}</div>}
          {!loading && !loadError && filtered.length === 0 && (
            <div style={{ textAlign:"center", padding:60, color:"#30304A" }}>
              <div style={{ fontSize:26, marginBottom:8 }}>◌</div>
              No entries match your filters.
            </div>
          )}

          {grouped.map(grp => (
            <div key={`${grp.year}-${grp.month}`} style={{ marginBottom:28 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:11 }}>
                <div style={{ fontSize:10, fontWeight:800, color:"#404068", textTransform:"uppercase", minWidth:24 }}>{MONTH_NAMES[parseInt(grp.month, 10)]}</div>
                <div style={{ fontSize:16, fontWeight:800, color:"#9090C0", letterSpacing:"-0.02em" }}>{grp.year}</div>
                <div style={{ flex:1, height:1, background:"#16162A" }} />
                <div style={{ fontSize:10, color:"#30304A" }}>{grp.entries.length} item{grp.entries.length!==1?"s":""}</div>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {grp.entries.map(entry => {
                  const cat = getCat(entry.category);
                  const open = expandedId === entry.id;
                  return (
                    <div key={entry.id} onClick={()=>setExpandedId(open ? null : entry.id)}
                      style={{ background: open ? "#0F0F1E" : "#0C0C18", border: open ? `1px solid ${cat.color}44` : "1px solid #161626", borderLeft: `3px solid ${cat.dot}`, borderRadius: 10, padding: "11px 14px", cursor: "pointer", transition: "background 0.12s, border-color 0.12s" }}>
                      
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5, flexWrap:"wrap" }}>
                            <span style={{ fontSize:10, fontWeight:700, background:`${cat.color}1A`, color:cat.color, padding:"2px 7px", borderRadius:4 }}>{cat.label.toUpperCase()}</span>
                            {entry.era && <span style={{ fontSize:10, color:"#50508A", background:"#121220", padding:"2px 7px", borderRadius:4 }}>{entry.era}</span>}
                            <span style={{ fontSize:11, color:"#38385A" }}>{niceDate(entry.date)}</span>
                          </div>
                          <div style={{ fontWeight:600, fontSize:14, color:"#D0D0F0", lineHeight:1.35 }}>{entry.title}</div>
                        </div>
                        <div style={{ color:"#28284A", fontSize:13, marginTop:3, flexShrink:0 }}>{open?"▾":"▸"}</div>
                      </div>

                      {open && (
                        <div style={{ marginTop:12, borderTop:"1px solid #161626", paddingTop:12 }}>
                          {entry.description && <p style={{ color:"#7878A8", fontSize:13, lineHeight:1.65, margin:"0 0 12px" }}>{entry.description}</p>}

                          <MediaGrid mediaUrls={entry.media} />

                          {(entry.platforms||[]).length > 0 && (
                            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop: 14, marginBottom:(entry.tags||[]).length?10:0 }}>
                              {entry.platforms.map((p,i) => {
                                const pm = PLATFORMS[p.type] || { label:p.type, color:"#888", bg:"#222" };
                                return (
                                  <a key={i} href={p.url} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
                                    style={{ display:"inline-flex", alignItems:"center", gap:5, background:pm.bg, color:pm.color, border:`1px solid ${pm.color}33`, padding:"4px 10px", borderRadius:6, fontSize:11, fontWeight:700, textDecoration:"none" }}>
                                    {pm.label} <span style={{ fontWeight:400, opacity:0.75 }}>→ {p.label}</span>
                                  </a>
                                );
                              })}
                            </div>
                          )}
                          
                          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop: 8 }}>
                            {(entry.tags||[]).map(tag => (
                              <span key={tag} onClick={e=>{ e.stopPropagation(); setSearch(tag); }}
                                style={{ fontSize:10, color:"#40407A", background:"#101020", border:"1px solid #1E1E38", padding:"2px 7px", borderRadius:4, cursor:"pointer" }}>
                                #{tag}
                              </span>
                            ))}
                          </div>

                          {unlocked && (
                            <div style={{ display:"flex", gap:8, borderTop:"1px solid #161626", marginTop:14, paddingTop:12 }} onClick={e=>e.stopPropagation()}>
                              <button onClick={() => triggerEdit(entry)} style={{ flex: 1, background: "rgba(167, 139, 250, 0.1)", border: "1px solid rgba(167, 139, 250, 0.3)", borderRadius: 6, color: "#A78BFA", fontSize: 11, fontWeight: 700, padding: "6px 10px", cursor: "pointer" }}>✏️ Edit Entry</button>
                              <button onClick={(e) => triggerDelete(e, entry.id)} style={{ background: "rgba(248, 113, 113, 0.1)", border: "1px solid rgba(248, 113, 113, 0.3)", borderRadius: 6, color: "#F87171", fontSize: 11, fontWeight: 700, padding: "6px 12px", cursor: "pointer" }}>🗑️ Delete</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {!loading && entries.length > 0 && (
            <div style={{ borderTop:"1px solid #121222", paddingTop:20, display:"flex", gap:16, flexWrap:"wrap", justifyContent:"center" }}>
              {CATEGORIES.slice(1).map(cat => (
                <div key={cat.id} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:cat.dot }} />
                  <span style={{ fontSize:11, color:"#30304A" }}>{cat.label}</span>
                  <span style={{ fontSize:11, color:"#50508A", fontWeight:700 }}>{entries.filter(e=>e.category===cat.id).length}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADMIN VIEW */}
      {view === "admin" && (
        <div style={{ maxWidth:580, margin:"0 auto", padding:"30px 18px 60px" }}>
          {!unlocked ? (
            <div style={{ background:"#0C0C18", border:"1px solid #1A1A2E", borderRadius:14, padding:"36px 28px", textAlign:"center" }}>
              <div style={{ fontSize:30, marginBottom:10 }}>🔐</div>
              <div style={{ fontWeight:700, fontSize:15, color:"#D0D0F0", marginBottom:4 }}>Admin Access</div>
              <div style={{ color:"#50508A", fontSize:13, marginBottom:22 }}>Enter password to manage entries.</div>
              <input type="password" value={pwInput} onChange={e=>setPwInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&tryUnlock()} placeholder="Password" style={{ ...inp, textAlign:"center", marginBottom:10 }} />
              {pwError && <div style={{ color:"#F87171", fontSize:12, marginBottom:10 }}>Incorrect password. Try again.</div>}
              <button onClick={tryUnlock} style={{ ...btn(true), width:"100%", padding:10, fontSize:14 }}>Unlock</button>
            </div>
          ) : (
            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
                <div style={{ fontWeight:700, fontSize:15, color:"#D0D0F0" }}>{editingId ? "⚙️ Edit Existing Entry" : "Add New Entry"}</div>
                {editingId && (
                  <button onClick={() => { setForm(BLANK); setEditingId(null); }} style={{ background:"#1F1F35", border:"none", borderRadius:6, color:"#9090C0", padding:"4px 8px", fontSize:11, cursor:"pointer" }}>Cancel Edit</button>
                )}
              </div>

              {saveOk && <div style={{ background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.25)", borderRadius:8, padding:"10px 14px", marginBottom:16, color:"#34D399", fontSize:13 }}>✓ Entry saved! It will appear in the archive now.</div>}
              {saveError && <div style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.25)", borderRadius:8, padding:"10px 14px", marginBottom:16, color:"#F87171", fontSize:13 }}>✕ Save failed: {saveError}</div>}

              <div style={{ display:"flex", flexDirection:"column", gap:15 }}>
                <div>
                  <label style={lbl}>Title *</label>
                  <input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Accendio Stage Performance" style={inp} />
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div>
                    <label style={lbl}>Date *</label>
                    <input type="date" value={form.date} onChange={e=>set("date",e.target.value)} style={{ ...inp, colorScheme:"dark" }} />
                  </div>
                  <div>
                    <label style={lbl}>Category *</label>
                    <select value={form.category} onChange={e=>set("category",e.target.value)} style={{ ...inp, cursor:"pointer" }}>
                      {CATEGORIES.slice(1).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={lbl}>Era / Comeback <span style={{ color:"#303050", fontWeight:400 }}>(optional)</span></label>
                  <input value={form.era} onChange={e=>set("era",e.target.value)} placeholder="e.g. Accendio" style={inp} />
                </div>

                <div>
                  <label style={lbl}>Description <span style={{ color:"#303050", fontWeight:400 }}>(optional)</span></label>
                  <textarea value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Context, details, or highlights..." rows={3} style={{ ...inp, resize:"vertical", lineHeight:1.55 }} />
                </div>

                {/* MEDIA INPUT */}
                <div>
                  <label style={lbl}>Gallery Media (Links & Uploads)</label>
                  <input 
                    value={form.media} 
                    onChange={e => set("media", e.target.value)} 
                    placeholder="Paste YouTube, ImgBB, or direct links..." 
                    style={{ ...inp, marginBottom: 8 }} 
                  />
                  <label style={{ display: "block", textAlign: "center", padding: "10px", border: "1px dashed #222235", borderRadius: 8, cursor: "pointer", color: "#50508A", fontSize: 12 }}>
                    {saving ? "Uploading..." : "📁 Upload File (Uses Storage)"}
                    <input 
                      type="file" 
                      accept="image/*,video/mp4,video/webm"
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setSaving(true);
                        try {
                          const url = await uploadMediaFile(file);
                          setForm(prev => ({...prev, media: prev.media ? prev.media + ", " + url : url}));
                        } catch (err) { alert("Upload failed: " + err.message); }
                        setSaving(false);
                        e.target.value = ""; 
                      }} 
                    />
                  </label>
                </div>

                <div>
                  <label style={lbl}>Tags <span style={{ color:"#303050", fontWeight:400 }}>(comma-separated)</span></label>
                  <input value={form.tags} onChange={e=>set("tags",e.target.value)} placeholder="MV, title track, Live" style={inp} />
                </div>

                <div>
                  <label style={lbl}>Platform Links</label>
                  <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                    {form.platforms.map((p,i) => (
                      <div key={i} style={{ display:"grid", gridTemplateColumns:"120px 1fr 90px auto", gap:7, alignItems:"center" }}>
                        <select value={p.type} onChange={e=>setPlatform(i,"type",e.target.value)} style={inp}>
                          {PLATFORM_KEYS.map(k => <option key={k} value={k}>{PLATFORMS[k].label}</option>)}
                        </select>
                        <input value={p.url} onChange={e=>setPlatform(i,"url",e.target.value)} placeholder="Paste URL…" style={inp} />
                        <input value={p.label} onChange={e=>setPlatform(i,"label",e.target.value)} placeholder="e.g. Stage" style={inp} />
                        {form.platforms.length > 1 && (
                          <button onClick={()=>setForm(f=>({...f,platforms:f.platforms.filter((_,j)=>j!==i)}))} style={{ ...btn(false), padding:"8px 10px", color:"#F87171" }}>✕</button>
                        )}
                      </div>
                    ))}
                    <button onClick={()=>setForm(f=>({...f,platforms:[...f.platforms,{type:"youtube",url:"",label:""}]}))}
                      style={{ ...btn(false), width:"100%", border:"1px dashed #202035", color:"#505078", marginTop:2, padding:8 }}>
                      + Add another link
                    </button>
                  </div>
                </div>

                <button onClick={handleSave} disabled={saving || !form.title || !form.date} style={{
                  ...btn(!saving && form.title && form.date),
                  padding:"11px", width:"100%", fontSize:14, marginTop:4,
                  opacity: (saving || !form.title || !form.date) ? 0.4 : 1,
                  cursor: (saving || !form.title || !form.date) ? "not-allowed" : "pointer",
                }}>
                  {saving ? "Saving Changes…" : editingId ? "Update Archive Entry" : "Save Entry to Archive"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
