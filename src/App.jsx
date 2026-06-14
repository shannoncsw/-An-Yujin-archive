import { useState, useMemo, useEffect } from "react";

// ================================================================
//  SECTION A · YOUR SETTINGS
const IDOL_NAME      = "안유진 · Ahn Yujin";                    // your idol's name
//  Everything else is handled automatically.
// ================================================================
const SUPABASE_URL   = "https://YOUR_PROJECT_ID.supabase.co";  // from Supabase dashboard
const SUPABASE_KEY   = "YOUR_ANON_KEY_HERE";                   // from Supabase dashboard
const ADMIN_PASSWORD = "archive2025";                           // pick any password you want
const IDOL_NAME      = "안유진 · An Yujin";                    // your idol's name

// ================================================================
//  SECTION B · CATEGORIES
//  These are the activity types you can filter by.
//  You can rename, add, or remove any of these.
//  Each has a "color" (for the filter button) and "dot" (for the
//  colored stripe on the left side of each card).
// ================================================================
const CATEGORIES = [
  { id: "all",       label: "All",          color: "#E2E2E2", dot: "#444455" },
  { id: "music",     label: "Music",         color: "#C084FC", dot: "#A855F7" },
  { id: "concert",   label: "Concert / FM",  color: "#F87171", dot: "#EF4444" },
  { id: "reality",   label: "Reality / TV",  color: "#34D399", dot: "#10B981" },
  { id: "cf",        label: "CF / Brand",    color: "#FBBF24", dot: "#F59E0B" },
  { id: "group",     label: "Group",         color: "#60A5FA", dot: "#3B82F6" },
  { id: "social",    label: "Social",  color: "#F472B6", dot: "#EC4899" },
  { id: "interview", label: "Interview",     color: "#A3E635", dot: "#84CC16" },
];

// ================================================================
//  SECTION C · PLATFORMS
//  The streaming/social platforms you can link to.
//  Each has a label, a text color, and a background color.
// ================================================================
const PLATFORMS = {
  youtube:   { label: "YouTube",    color: "#FF5555", bg: "rgba(255,85,85,0.12)"  },
  twitter:   { label: "Twitter/X",  color: "#60C4F0", bg: "rgba(96,196,240,0.12)" },
  instagram: { label: "Instagram",  color: "#F070A0", bg: "rgba(240,112,160,0.12)"},
  bubble:   { label: "Bubble",    color: "#5BE4B4", bg: "rgba(91,228,180,0.12)" },
};
const PLATFORM_KEYS = Object.keys(PLATFORMS);

// ================================================================
//  SECTION D · DEMO DATA
//  This is fake data just for the preview so you can see how the
//  app looks before connecting Supabase. Once you set up Supabase,
//  all your real entries live in the database — not here.
// ================================================================
const DEMO_DATA = [
  { id:1,  date:"2025-02-28", title:"IVE – 'Accendio' MV",                           category:"music",    era:"Accendio",   description:"Title track MV from IVE's 2nd full album 'Accendio'. Yujin center scenes went viral immediately. MV surpassed 20M views in under 48hrs.", platforms:[{type:"youtube",url:"#",label:"MV"},{type:"twitter",url:"#",label:"Fancam thread"}],   tags:["MV","Accendio","IVE","title track","2nd full album"] },
  { id:2,  date:"2025-02-20", title:"Accendio Showcase – Yujin Focus",                category:"music",    era:"Accendio",   description:"IVE 2nd full album showcase. Yujin's speech went viral. Full group performance of all title tracks.",                                                           platforms:[{type:"youtube",url:"#",label:"Showcase VOD"},{type:"weverse",url:"#",label:"Live"}],   tags:["showcase","Accendio","speech","IVE"] },
  { id:3,  date:"2025-01-15", title:"Knowing Bros – IVE Episode",                     category:"reality",  era:"Accendio",   description:"IVE as guests on Knowing Bros. Yujin's iconic moments: the ad-lib battle and the transfer student game. Clipped widely on TikTok.",                              platforms:[{type:"youtube",url:"#",label:"Full Ep"},{type:"twitter",url:"#",label:"Clips"}],       tags:["Knowing Bros","variety","IVE","iconic"] },
  { id:4,  date:"2024-12-31", title:"MBC Gayo Daejejeon – IVE Stage",                 category:"music",    era:"Either Way", description:"Year-end performance. IVE performed a medley including 'Either Way' and 'Baddie'. Yujin's ending fairy pose trended on Twitter.",                  platforms:[{type:"youtube",url:"#",label:"Stage"},{type:"twitter",url:"#",label:"Fancams"}],       tags:["Gayo","year-end","MBC","Either Way","performance"] },
  { id:5,  date:"2024-12-25", title:"Weverse Christmas Solo Live",                    category:"social",   era:"Either Way", description:"2+ hour solo Christmas Weverse live. Talked about 2024 highlights, sang festive songs, surprised fans.",                                                             platforms:[{type:"weverse",url:"#",label:"VOD"},{type:"twitter",url:"#",label:"Clips"}],           tags:["vlive","Christmas","Weverse","solo live","fan talk"] },
  { id:6,  date:"2024-11-01", title:"IVE – 'Either Way' MV",                         category:"music",    era:"Either Way", description:"Emotional ballad MV. Complete image switch from Baddie era. Yujin's acting praised widely. Currently 50M+ views.",                                               platforms:[{type:"youtube",url:"#",label:"MV"},{type:"instagram",url:"#",label:"Stills"}],         tags:["MV","Either Way","IVE","ballad"] },
  { id:7,  date:"2024-09-14", title:"IVE SHOW WHAT I HAVE – Seoul Concert",          category:"concert",  era:"Baddie",     description:"IVE's first solo concert tour. Yujin's solo stage was an acoustic 'ELEVEN'. Fan accounts call it the highlight of the night.",                          platforms:[{type:"twitter",url:"#",label:"Setlist"},{type:"weverse",url:"#",label:"Fancams"}],     tags:["SHOW WHAT I HAVE","concert","Seoul","solo stage","tour"] },
  { id:8,  date:"2024-08-22", title:"IVE – 'Baddie' MV",                               category:"music",    era:"Baddie",     description:"Powerful concept MV. Yujin's blonde hair for this era became iconic. MV hit 30M views in 24hrs. Choreography widely covered.",                                     platforms:[{type:"youtube",url:"#",label:"MV"},{type:"twitter",url:"#",label:"Fancam"}],           tags:["MV","Baddie","IVE","blonde","concept"] },
  { id:9,  date:"2024-07-10", title:"McDonald's Korea x Yujin CF",                   category:"cf",       era:"Baddie",     description:"Solo CF for McDonald's Korea summer campaign. Multiple cuts: 15s, 30s, 60s. BTS content released on IG.",                                                          platforms:[{type:"youtube",url:"#",label:"CF"},{type:"instagram",url:"#",label:"BTS"}],            tags:["McDonald's","CF","solo","summer"] },
  { id:10, date:"2024-06-01", title:"IVE Summer Package 2024 – Bali",                  category:"group",    era:"Baddie",     description:"IVE official summer package filmed in Bali. Yujin's volleyball game moment clipped widely on Weverse.",                                                           platforms:[{type:"weverse",url:"#",label:"BTS Clips"},{type:"youtube",url:"#",label:"Trailer"}],   tags:["summer package","Bali","IVE","group","DVD"] },
  { id:11, date:"2024-04-12", title:"Running Man – Ep. 700 Special",                   category:"reality",  era:"I AM",       description:"700th episode idol special. Yujin's race mission moments generated huge fan content online.",                                                                       platforms:[{type:"youtube",url:"#",label:"Clips"},{type:"naver",url:"#",label:"Full Ep"}],         tags:["Running Man","variety","ep700","iconic"] },
  { id:12, date:"2024-03-27", title:"IVE – 'I AM' MV",                                  category:"music",    era:"I AM",       description:"Empowerment concept MV from IVE's 1st full album 'I've IVE'. Yujin's center moments praised. Currently 150M+ views.",                                  platforms:[{type:"youtube",url:"#",label:"MV"},{type:"twitter",url:"#",label:"Reaction thread"}],  tags:["MV","I AM","Ive IVE","1st full album","IVE"] },
  { id:13, date:"2024-02-14", title:"Lotte Duty Free Valentine's CF",                 category:"cf",       era:"I AM",       description:"Valentine's campaign CF for Lotte Duty Free. Solo and group cuts both released. Yujin's individual version charmed fans worldwide.",                            platforms:[{type:"youtube",url:"#",label:"CF"},{type:"instagram",url:"#",label:"Stills"}],         tags:["Lotte","CF","Valentine","Duty Free"] },
  { id:14, date:"2023-12-31", title:"KBS Gayo Daechukje – IVE Stage",                  category:"music",    era:"Kitsch",     description:"Year-end KBS performance. IVE performed Kitsch and After LIKE. Yujin's look became a top trending topic.",                                                         platforms:[{type:"youtube",url:"#",label:"Stage"},{type:"twitter",url:"#",label:"Fancams"}],       tags:["Gayo","year-end","KBS","Kitsch","After LIKE"] },
  { id:15, date:"2023-08-21", title:"IVE – 'Kitsch' MV",                               category:"music",    era:"Kitsch",     description:"Retro-inspired concept. First time IVE had a fan-participatory MV concept. Yujin's vocal part in the bridge highlighted widely.",                                   platforms:[{type:"youtube",url:"#",label:"MV"},{type:"instagram",url:"#",label:"Concept photos"}], tags:["MV","Kitsch","IVE","retro"] },
];

// ================================================================
//  SECTION E · SUPABASE HELPERS
//  These are the two functions that talk to your database.
//  "fetchEntries" loads all entries. "saveEntry" adds a new one.
//  You don't need to edit these — they just use the URL and KEY
//  you set at the top.
// ================================================================

// Detects if you're still using placeholder credentials
const IS_DEMO = SUPABASE_URL.includes("YOUR_PROJECT_ID");

// Loads all entries from the database, newest date first
async function fetchEntries() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/entries?select=*&order=date.desc`,
    { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
  );
  if (!res.ok) throw new Error(`Database error: ${res.status}`);
  return res.json();
}

// Saves one new entry to the database
async function saveEntry(entry) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/entries`,
    {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify(entry),
    }
  );
  if (!res.ok) throw new Error(`Could not save: ${res.status}`);
  return res.json();
}

// ================================================================
//  SECTION F · SMALL HELPER FUNCTIONS
//  Tiny utilities used throughout the component.
// ================================================================
const MONTH_NAMES = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Finds a category's color/label by its id (e.g. "music")
function getCat(id) { return CATEGORIES.find(c => c.id === id) || CATEGORIES[1]; }

// Turns "2024-11-15" into "15 Nov 2024"
function niceDate(d) {
  const [y,m,day] = d.split("-");
  return `${parseInt(day)} ${MONTH_NAMES[parseInt(m)]} ${y}`;
}

// Groups a flat list of entries into { year, month, entries[] }
function groupByMonth(entries) {
  const map = {};
  entries.forEach(e => {
    const key = e.date.slice(0,7); // "2024-11"
    if (!map[key]) map[key] = [];
    map[key].push(e);
  });
  return Object.entries(map)
    .sort(([a],[b]) => b.localeCompare(a)) // newest first
    .map(([key, list]) => ({ year:key.slice(0,4), month:key.slice(5,7), entries:list }));
}

// ================================================================
//  SECTION G · THE MAIN COMPONENT
//  This is the actual app. It manages all the state (what's
//  selected, what the form says, whether admin is unlocked, etc.)
//  and renders the two views: Archive and Admin.
// ================================================================
export default function KpopArchive() {

  // ── Which screen are we on? ──────────────────────────────────
  const [view, setView] = useState("archive"); // "archive" or "admin"

  // ── Archive data ─────────────────────────────────────────────
  const [entries, setEntries]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState(null);

  // ── Archive filters ──────────────────────────────────────────
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch]       = useState("");
  const [expandedId, setExpandedId] = useState(null);

  // ── Admin: password gate ─────────────────────────────────────
  const [unlocked, setUnlocked]       = useState(false);
  const [pwInput, setPwInput]         = useState("");
  const [pwError, setPwError]         = useState(false);

  // ── Admin: save status ───────────────────────────────────────
  const [saving, setSaving]           = useState(false);
  const [saveOk, setSaveOk]           = useState(false);
  const [saveError, setSaveError]     = useState(null);

  // ── Admin: the "Add Entry" form ──────────────────────────────
  const BLANK = {
    title:"", date:"", category:"music", era:"",
    description:"", tags:"",
    platforms:[{ type:"youtube", url:"", label:"" }],
  };
  const [form, setForm] = useState(BLANK);

  // ── Load entries when the app first opens ────────────────────
  // useEffect runs once on startup. If we're in demo mode, load
  // the fake data. Otherwise fetch real data from Supabase.
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

  // ── Filter entries based on search + category ────────────────
  // useMemo recalculates this only when entries/activeCat/search changes
  const filtered = useMemo(() => entries.filter(e => {
    const matchCat  = activeCat === "all" || e.category === activeCat;
    const q         = search.toLowerCase();
    const matchText = !q ||
      e.title.toLowerCase().includes(q) ||
      (e.description||"").toLowerCase().includes(q) ||
      (e.era||"").toLowerCase().includes(q) ||
      (e.tags||[]).some(t => t.toLowerCase().includes(q));
    return matchCat && matchText;
  }), [entries, activeCat, search]);

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);

  // ── Admin: check password ────────────────────────────────────
  function tryUnlock() {
    if (pwInput === ADMIN_PASSWORD) { setUnlocked(true); setPwError(false); }
    else setPwError(true);
  }

  // ── Admin: update a single field in the form ─────────────────
  function set(field, val) { setForm(f => ({ ...f, [field]: val })); }

  // ── Admin: update one platform link row ──────────────────────
  function setPlatform(i, field, val) {
    setForm(f => {
      const p = [...f.platforms];
      p[i] = { ...p[i], [field]: val };
      return { ...f, platforms: p };
    });
  }

  // ── Admin: save the form to Supabase (or demo state) ─────────
  async function handleSave() {
    if (!form.title || !form.date) return;
    setSaving(true); setSaveError(null);

    // Build the final entry object from the form
    const entry = {
      title:       form.title.trim(),
      date:        form.date,
      category:    form.category,
      era:         form.era.trim(),
      description: form.description.trim(),
      tags:        form.tags.split(",").map(t => t.trim()).filter(Boolean),
      platforms:   form.platforms.filter(p => p.url.trim()),
    };

    try {
      if (IS_DEMO) {
        // Demo mode: just add to local list, no real database
        setEntries(prev => [{ ...entry, id: Date.now() }, ...prev]
          .sort((a,b) => b.date.localeCompare(a.date)));
      } else {
        // Real mode: send to Supabase, then add the saved entry to the list
        const [saved] = await saveEntry(entry);
        setEntries(prev => [saved, ...prev].sort((a,b) => b.date.localeCompare(a.date)));
      }
      setForm(BLANK);
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 4000);
    } catch(e) {
      setSaveError(e.message);
    }
    setSaving(false);
  }

  // ── Reusable style snippets ───────────────────────────────────
  const inp  = { width:"100%", boxSizing:"border-box", background:"#13131F", border:"1px solid #222235", borderRadius:8, padding:"8px 12px", color:"#C8C8E8", fontSize:13, outline:"none" };
  const lbl  = { fontSize:10, color:"#50508A", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:5, fontWeight:700 };
  const btn  = (active) => ({ padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, background: active ? "#A78BFA" : "#13131F", color: active ? "#0A0A0F" : "#50508A" });

  // ================================================================
  //  RENDER
  // ================================================================
  return (
    <div style={{ minHeight:"100vh", background:"#08080F", color:"#E4E4F4", fontFamily:"'Inter','Helvetica Neue',sans-serif", fontSize:14 }}>

      {/* ────────────────────────────────────────────────────────
          HEADER — always visible at the top
      ──────────────────────────────────────────────────────── */}
      <div style={{ borderBottom:"1px solid #18182A", padding:"16px 22px 12px", position:"sticky", top:0, zIndex:10, background:"rgba(8,8,15,0.96)", backdropFilter:"blur(14px)" }}>

        {/* Top row: idol name + Archive/Admin tabs */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div>
            {IS_DEMO && (
              <div style={{ fontSize:10, color:"#FBBF24", background:"rgba(251,191,36,0.08)", border:"1px solid rgba(251,191,36,0.2)", padding:"2px 8px", borderRadius:4, display:"inline-block", marginBottom:5 }}>
                DEMO MODE · fill in SUPABASE_URL &amp; KEY to go live
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

        {/* Search + category chips (archive view only) */}
        {view === "archive" && <>
          <div style={{ position:"relative", marginBottom:10 }}>
            <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#30305A", fontSize:15 }}>⌕</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search titles, tags, eras…" style={{ ...inp, paddingLeft:30 }} />
            {search && <button onClick={()=>setSearch("")} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#505080", cursor:"pointer", fontSize:16 }}>×</button>}
          </div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {CATEGORIES.map(cat => {
              const on = activeCat === cat.id;
              return (
                <button key={cat.id} onClick={()=>setActiveCat(cat.id)} style={{
                  padding:"3px 10px", borderRadius:20, border:"none", cursor:"pointer",
                  fontSize:11, fontWeight:700, letterSpacing:"0.04em",
                  background: on ? cat.color : "transparent",
                  color:      on ? "#0A0A0F" : cat.color,
                  outline:    on ? "none" : `1px solid ${cat.color}44`,
                  transition:"all 0.12s",
                }}>{cat.label}</button>
              );
            })}
          </div>
        </>}
      </div>

      {/* ────────────────────────────────────────────────────────
          ARCHIVE VIEW
          Shows the timeline of entries, grouped by month.
      ──────────────────────────────────────────────────────── */}
      {view === "archive" && (
        <div style={{ maxWidth:740, margin:"0 auto", padding:"22px 18px 60px" }}>

          {/* Loading / error / empty states */}
          {loading   && <div style={{ textAlign:"center", padding:60, color:"#40405A" }}>Loading…</div>}
          {loadError && <div style={{ textAlign:"center", padding:60, color:"#F87171" }}>{loadError}</div>}
          {!loading && !loadError && filtered.length === 0 && (
            <div style={{ textAlign:"center", padding:60, color:"#30304A" }}>
              <div style={{ fontSize:26, marginBottom:8 }}>◌</div>
              No entries match your filters.
            </div>
          )}

          {/* One section per month */}
          {grouped.map(grp => (
            <div key={`${grp.year}-${grp.month}`} style={{ marginBottom:28 }}>

              {/* Month/year divider */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:11 }}>
                <div style={{ fontSize:10, fontWeight:800, color:"#404068", textTransform:"uppercase", minWidth:24 }}>{MONTH_NAMES[parseInt(grp.month)]}</div>
                <div style={{ fontSize:16, fontWeight:800, color:"#9090C0", letterSpacing:"-0.02em" }}>{grp.year}</div>
                <div style={{ flex:1, height:1, background:"#16162A" }} />
                <div style={{ fontSize:10, color:"#30304A" }}>{grp.entries.length} item{grp.entries.length!==1?"s":""}</div>
              </div>

              {/* Entry cards */}
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {grp.entries.map(entry => {
                  const cat = getCat(entry.category);
                  const open = expandedId === entry.id;
                  return (
                    <div key={entry.id}
                      onClick={()=>setExpandedId(open ? null : entry.id)}
                      style={{
                        background:  open ? "#0F0F1E" : "#0C0C18",
                        border:      open ? `1px solid ${cat.color}44` : "1px solid #161626",
                        borderLeft:  `3px solid ${cat.dot}`,
                        borderRadius: 10,
                        padding:     "11px 14px",
                        cursor:      "pointer",
                        transition:  "background 0.12s, border-color 0.12s",
                      }}
                    >
                      {/* Card top row */}
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5, flexWrap:"wrap" }}>
                            {/* Category badge */}
                            <span style={{ fontSize:10, fontWeight:700, background:`${cat.color}1A`, color:cat.color, padding:"2px 7px", borderRadius:4 }}>
                              {cat.label.toUpperCase()}
                            </span>
                            {/* Era badge (optional) */}
                            {entry.era && (
                              <span style={{ fontSize:10, color:"#50508A", background:"#121220", padding:"2px 7px", borderRadius:4 }}>{entry.era}</span>
                            )}
                            {/* Date */}
                            <span style={{ fontSize:11, color:"#38385A" }}>{niceDate(entry.date)}</span>
                          </div>
                          <div style={{ fontWeight:600, fontSize:14, color:"#D0D0F0", lineHeight:1.35 }}>{entry.title}</div>
                        </div>
                        <div style={{ color:"#28284A", fontSize:13, marginTop:3, flexShrink:0 }}>{open?"▾":"▸"}</div>
                      </div>

                      {/* Expanded details */}
                      {open && (
                        <div style={{ marginTop:12, borderTop:"1px solid #161626", paddingTop:12 }}>
                          {entry.description && (
                            <p style={{ color:"#7878A8", fontSize:13, lineHeight:1.65, margin:"0 0 12px" }}>{entry.description}</p>
                          )}
                          {/* Platform links */}
                          {(entry.platforms||[]).length > 0 && (
                            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:(entry.tags||[]).length?10:0 }}>
                              {entry.platforms.map((p,i) => {
                                const pm = PLATFORMS[p.type] || { label:p.type, color:"#888", bg:"#222" };
                                return (
                                  <a key={i} href={p.url} target="_blank" rel="noreferrer"
                                    onClick={e=>e.stopPropagation()}
                                    style={{ display:"inline-flex", alignItems:"center", gap:5, background:pm.bg, color:pm.color, border:`1px solid ${pm.color}33`, padding:"4px 10px", borderRadius:6, fontSize:11, fontWeight:700, textDecoration:"none" }}>
                                    {pm.label} <span style={{ fontWeight:400, opacity:0.75 }}>→ {p.label}</span>
                                  </a>
                                );
                              })}
                            </div>
                          )}
                          {/* Tags — clicking one sets it as the search term */}
                          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                            {(entry.tags||[]).map(tag => (
                              <span key={tag}
                                onClick={e=>{ e.stopPropagation(); setSearch(tag); }}
                                style={{ fontSize:10, color:"#40407A", background:"#101020", border:"1px solid #1E1E38", padding:"2px 7px", borderRadius:4, cursor:"pointer" }}>
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Footer: count per category */}
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

      {/* ────────────────────────────────────────────────────────
          ADMIN VIEW
          Password-protected. Shows a form to add new entries.
      ──────────────────────────────────────────────────────── */}
      {view === "admin" && (
        <div style={{ maxWidth:580, margin:"0 auto", padding:"30px 18px 60px" }}>

          {/* ── Password gate ── */}
          {!unlocked ? (
            <div style={{ background:"#0C0C18", border:"1px solid #1A1A2E", borderRadius:14, padding:"36px 28px", textAlign:"center" }}>
              <div style={{ fontSize:30, marginBottom:10 }}>🔐</div>
              <div style={{ fontWeight:700, fontSize:15, color:"#D0D0F0", marginBottom:4 }}>Admin Access</div>
              <div style={{ color:"#50508A", fontSize:13, marginBottom:22 }}>Enter your password to manage entries.</div>
              <input
                type="password" value={pwInput}
                onChange={e=>setPwInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&tryUnlock()}
                placeholder="Password"
                style={{ ...inp, textAlign:"center", marginBottom:10 }}
              />
              {pwError && <div style={{ color:"#F87171", fontSize:12, marginBottom:10 }}>Incorrect password. Try again.</div>}
              <button onClick={tryUnlock} style={{ ...btn(true), width:"100%", padding:10, fontSize:14 }}>Unlock</button>
            </div>

          ) : (
            /* ── Add entry form ── */
            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
                <div style={{ fontWeight:700, fontSize:15, color:"#D0D0F0" }}>Add New Entry</div>
                <div style={{ fontSize:11, color:"#40405A" }}>{entries.length} entries total</div>
              </div>

              {/* Success banner */}
              {saveOk && (
                <div style={{ background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.25)", borderRadius:8, padding:"10px 14px", marginBottom:16, color:"#34D399", fontSize:13 }}>
                  ✓ Entry saved! It will appear in the archive now.
                </div>
              )}

              {/* Error banner */}
              {saveError && (
                <div style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.25)", borderRadius:8, padding:"10px 14px", marginBottom:16, color:"#F87171", fontSize:13 }}>
                  ✕ Save failed: {saveError}
                </div>
              )}

              <div style={{ display:"flex", flexDirection:"column", gap:15 }}>

                {/* Title */}
                <div>
                  <label style={lbl}>Title *</label>
                  <input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. ECLIPSE – Title Track MV" style={inp} />
                </div>

                {/* Date + Category (side by side) */}
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

                {/* Era */}
                <div>
                  <label style={lbl}>Era / Comeback <span style={{ color:"#303050", fontWeight:400 }}>(optional)</span></label>
                  <input value={form.era} onChange={e=>set("era",e.target.value)} placeholder="e.g. MOONRISE, PRISM — or leave blank" style={inp} />
                </div>

                {/* Description */}
                <div>
                  <label style={lbl}>Description <span style={{ color:"#303050", fontWeight:400 }}>(optional)</span></label>
                  <textarea value={form.description} onChange={e=>set("description",e.target.value)} placeholder="What happened? Context, view counts, notable moments…" rows={3} style={{ ...inp, resize:"vertical", lineHeight:1.55 }} />
                </div>

                {/* Tags */}
                <div>
                  <label style={lbl}>Tags <span style={{ color:"#303050", fontWeight:400 }}>(comma-separated)</span></label>
                  <input value={form.tags} onChange={e=>set("tags",e.target.value)} placeholder="MV, title track, MOONRISE, Inkigayo" style={inp} />
                </div>

                {/* Platform links */}
                <div>
                  <label style={lbl}>Platform Links</label>
                  <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                    {form.platforms.map((p,i) => (
                      <div key={i} style={{ display:"grid", gridTemplateColumns:"120px 1fr 90px auto", gap:7, alignItems:"center" }}>
                        {/* Platform dropdown */}
                        <select value={p.type} onChange={e=>setPlatform(i,"type",e.target.value)} style={inp}>
                          {PLATFORM_KEYS.map(k => <option key={k} value={k}>{PLATFORMS[k].label}</option>)}
                        </select>
                        {/* URL */}
                        <input value={p.url} onChange={e=>setPlatform(i,"url",e.target.value)} placeholder="Paste URL…" style={inp} />
                        {/* Link label */}
                        <input value={p.label} onChange={e=>setPlatform(i,"label",e.target.value)} placeholder="e.g. MV" style={inp} />
                        {/* Remove button */}
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

                {/* Save */}
                <button onClick={handleSave} disabled={saving || !form.title || !form.date} style={{
                  ...btn(!saving && form.title && form.date),
                  padding:"11px", width:"100%", fontSize:14, marginTop:4,
                  opacity: (saving || !form.title || !form.date) ? 0.4 : 1,
                  cursor: (saving || !form.title || !form.date) ? "not-allowed" : "pointer",
                }}>
                  {saving ? "Saving…" : "Save Entry to Archive"}
                </button>

              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
