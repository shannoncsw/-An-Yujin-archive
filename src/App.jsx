import { useState, useMemo, useEffect, useRef } from "react";

// ================================================================
// A · YOUR SETTINGS — only these 5 lines ever need changing
// ================================================================
const SUPABASE_URL   = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_KEY   = "YOUR_ANON_KEY_HERE";
const ADMIN_PASSWORD = "archive2025";
const IDOL_NAME      = "안유진 · Ahn Yujin";
const IDOL_IMAGE     = "https://i.pinimg.com/736x/82/3a/0d/823a0d3b6bb81ef51b5c496be11311de.jpg";

// ================================================================
// B · CATEGORIES
// Rename, add, or remove these however you like.
// "color" = filter chip color. "dot" = card side stripe color.
// ================================================================
const CATEGORIES = [
  { id:"all",       label:"All",          color:"#E2E2E2", dot:"#444455" },
  { id:"music",     label:"Music",         color:"#C084FC", dot:"#A855F7" },
  { id:"concert",   label:"Concert / FM",  color:"#F87171", dot:"#EF4444" },
  { id:"reality",   label:"Reality / TV",  color:"#34D399", dot:"#10B981" },
  { id:"cf",        label:"CF / Brand",    color:"#FBBF24", dot:"#F59E0B" },
  { id:"group",     label:"Group",         color:"#60A5FA", dot:"#3B82F6" },
  { id:"social",    label:"Social / Fan",  color:"#F472B6", dot:"#EC4899" },
  { id:"interview", label:"Interview",     color:"#A3E635", dot:"#84CC16" },
];

// ================================================================
// C · MEDIA UTILITIES
// These functions look at a URL and figure out what kind it is.
// You don't need to touch these.
// ================================================================

// Extracts the 11-character video ID from any YouTube URL format
function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
// Extracts the tweet ID number from a Twitter/X URL
function getTwitterId(url) {
  if (!url) return null;
  const m = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i);
  return m ? m[1] : null;
}
// Extracts the post shortcode from an Instagram URL
function getInstagramId(url) {
  if (!url) return null;
  const m = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i);
  return m ? m[1] : null;
}
// Extracts the video ID from a TikTok URL
function getTikTokId(url) {
  if (!url) return null;
  const m = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/i);
  return m ? m[1] : null;
}
// Checks if a URL points directly to a video file
function isVideoFile(url) {
  return url ? /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url) : false;
}
// Returns a label for what type of URL this is
function getMediaType(url) {
  if (!url) return "unknown";
  if (getYouTubeId(url))   return "youtube";
  if (getTwitterId(url))   return "twitter";
  if (getInstagramId(url)) return "instagram";
  if (getTikTokId(url))    return "tiktok";
  if (isVideoFile(url))    return "video";
  return "image"; // anything else is treated as a direct image link
}

// Colors for the platform label badges shown in grid thumbnails
const PTYPE = {
  youtube:   { label:"YouTube",   color:"#FF5555" },
  twitter:   { label:"Twitter/X", color:"#60C4F0" },
  instagram: { label:"Instagram", color:"#F070A0" },
  tiktok:    { label:"TikTok",    color:"#FF6B8A" },
  video:     { label:"Video",     color:"#A0A0C0" },
};

// ================================================================
// D · MEDIA GRID COMPONENT
//
// This is the 3-photo/video grid that appears on each entry card.
// - Shows up to 3 thumbnails side by side
// - If there are more than 3, the 3rd thumbnail shows "+N more"
// - Clicking any thumbnail opens a fullscreen lightbox
// - The lightbox has prev/next arrows to browse all media
// ================================================================
function MediaGrid({ media }) {
  const [lb, setLb] = useState(null); // null = closed, number = index of open item

  // Don't render anything if there's no media
  if (!media || media.length === 0) return null;

  const overflow = media.length - 3; // how many are hidden after the 3rd

  return (
    <>
      {/* ── 3-COLUMN THUMBNAIL GRID ── */}
      <div style={{ display:"grid", gridTemplateColumns:`repeat(${Math.min(media.length,3)}, 1fr)`, gap:6, marginTop:12 }}>
        {media.slice(0, 3).map((url, i) => {
          const type  = getMediaType(url);
          const ytId  = getYouTubeId(url);
          const isLast = i === 2 && overflow > 0; // 3rd item when there are hidden ones
          const pt    = PTYPE[type];

          return (
            <div key={i}
              onClick={e => { e.stopPropagation(); setLb(i); }}
              style={{ position:"relative", aspectRatio:"1/1", background:"#0C0C1C", borderRadius:8, overflow:"hidden", cursor:"pointer", border:"1px solid #1A1A30" }}
            >
              {/* What to show as the thumbnail */}
              {ytId ? (
                // YouTube: use the auto-generated thumbnail image
                <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              ) : type === "image" ? (
                // Direct image URL: show the image
                <img src={url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { e.target.style.opacity="0.1"; }} />
              ) : type === "video" ? (
                // Direct video file: show first frame
                <video src={url} muted preload="metadata" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              ) : pt ? (
                // Twitter, Instagram, TikTok: show a platform label (can't auto-thumbnail these)
                <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"#10102A" }}>
                  <span style={{ fontSize:10, color:pt.color, fontWeight:700, letterSpacing:"0.06em" }}>{pt.label}</span>
                </div>
              ) : null}

              {/* Play icon on top of video thumbnails */}
              {(type === "youtube" || type === "video") && !isLast && (
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.2)" }}>
                  <div style={{ width:28, height:28, background:"rgba(168,85,247,0.88)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="10" height="12" viewBox="0 0 10 12" fill="white"><path d="M0 0v12l10-6z"/></svg>
                  </div>
                </div>
              )}

              {/* "+N more" overlay on the last visible thumbnail */}
              {isLast && (
                <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.78)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:20, fontWeight:800, color:"#FFF", lineHeight:1 }}>+{overflow}</span>
                  <span style={{ fontSize:9, color:"#9090B0", textTransform:"uppercase", letterSpacing:"0.1em", marginTop:3 }}>more</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── FULLSCREEN LIGHTBOX ── */}
      {/* Only renders when lb is a number (an item was clicked) */}
      {lb !== null && (() => {
        const url     = media[lb];
        const type    = getMediaType(url);
        const ytId    = getYouTubeId(url);
        const tweetId = getTwitterId(url);
        const igId    = getInstagramId(url);
        const ttId    = getTikTokId(url);
        // Twitter, Instagram, and TikTok embeds are tall/vertical; everything else is widescreen
        const isVert  = !!(tweetId || igId || ttId);

        return (
          // Dark backdrop — clicking it closes the lightbox
          <div onClick={() => setLb(null)}
            style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.94)", display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(10px)" }}
          >
            {/* Close button */}
            <button onClick={() => setLb(null)} style={{ position:"absolute", top:14, right:18, background:"none", border:"none", color:"#CCC", fontSize:34, cursor:"pointer", zIndex:10, lineHeight:1 }}>×</button>

            {/* Counter: "3 / 7" */}
            <div style={{ position:"absolute", top:20, left:"50%", transform:"translateX(-50%)", color:"#606080", fontSize:12, fontFamily:"monospace" }}>{lb+1} / {media.length}</div>

            {/* Previous arrow */}
            {lb > 0 && (
              <button onClick={e => { e.stopPropagation(); setLb(lb-1); }}
                style={{ position:"absolute", left:10, zIndex:10, background:"rgba(15,15,35,0.7)", border:"none", color:"#FFF", width:40, height:40, borderRadius:"50%", cursor:"pointer", fontSize:22, display:"flex", alignItems:"center", justifyContent:"center" }}>‹</button>
            )}

            {/* Next arrow */}
            {lb < media.length-1 && (
              <button onClick={e => { e.stopPropagation(); setLb(lb+1); }}
                style={{ position:"absolute", right:10, zIndex:10, background:"rgba(15,15,35,0.7)", border:"none", color:"#FFF", width:40, height:40, borderRadius:"50%", cursor:"pointer", fontSize:22, display:"flex", alignItems:"center", justifyContent:"center" }}>›</button>
            )}

            {/* The actual media content */}
            <div onClick={e => e.stopPropagation()}
              style={{
                width:"100%",
                maxWidth: isVert ? 440 : 920,
                aspectRatio: isVert ? "auto" : "16/9",
                height: isVert ? "84vh" : "auto",
                background:"#000",
                borderRadius:12,
                overflow:"hidden",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
              }}
            >
              {ytId    ? <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1`} style={{ width:"100%", height:"100%", border:"none" }} allow="autoplay; encrypted-media" allowFullScreen />
              : tweetId ? <iframe src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=dark`} style={{ width:"100%", height:"100%", border:"none" }} />
              : igId    ? <iframe src={`https://www.instagram.com/p/${igId}/embed/captioned/`} style={{ width:"100%", height:"100%", border:"none", background:"#FFF" }} scrolling="no" />
              : ttId    ? <iframe src={`https://www.tiktok.com/embed/v2/${ttId}`} style={{ width:"100%", height:"100%", border:"none" }} />
              : type === "video" ? <video src={url} controls autoPlay style={{ maxWidth:"100%", maxHeight:"100%" }} />
              : <img src={url} alt="" style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain" }} />}
            </div>
          </div>
        );
      })()}
    </>
  );
}

// ================================================================
// E · DEMO DATA (Yujin / IVE)
// This shows example entries so you can see the app before
// connecting Supabase. Replace YouTube URLs and image links
// with real ones — then delete this section once Supabase is set up.
// ================================================================
const DEMO_DATA = [
  {
    id:1, date:"2025-02-28", title:"IVE – 'Accendio' MV", category:"music", era:"Accendio",
    description:"Title track MV from IVE's 2nd full album. Yujin's center scenes went viral immediately. Surpassed 20M views in under 48hrs.",
    media:[
      "https://www.youtube.com/watch?v=REPLACE_WITH_REAL_ID",
      "https://i.pinimg.com/736x/82/3a/0d/823a0d3b6bb81ef51b5c496be11311de.jpg",
      "https://i.pinimg.com/736x/43/ba/0a/43ba0a9d94fa2bfe2c3498be60e70417.jpg",
    ],
    tags:["MV","Accendio","IVE","title track","2nd full album"],
  },
  {
    id:2, date:"2025-01-15", title:"Knowing Bros – IVE Episode", category:"reality", era:"Accendio",
    description:"IVE as guests. Yujin's ad-lib battle and transfer student game moments clipped widely on TikTok.",
    media:[
      "https://i.pinimg.com/736x/3b/bc/2a/3bbc2a84d8521bc142ab4c88a834b123.jpg",
      "https://i.pinimg.com/736x/f5/61/8b/f5618b7634d19bde308ef61a9bc38e3e.jpg",
    ],
    tags:["Knowing Bros","variety","IVE","iconic"],
  },
  {
    id:3, date:"2024-12-31", title:"MBC Gayo Daejejeon – IVE Stage", category:"music", era:"Either Way",
    description:"Year-end performance. IVE performed 'Either Way' and 'Baddie' medley. Yujin's ending fairy pose trended on Twitter.",
    media:[
      "https://www.youtube.com/watch?v=REPLACE_WITH_REAL_ID",
      "https://i.pinimg.com/736x/82/3a/0d/823a0d3b6bb81ef51b5c496be11311de.jpg",
    ],
    tags:["Gayo","year-end","MBC","performance"],
  },
  {
    id:4, date:"2024-11-01", title:"IVE – 'Either Way' MV", category:"music", era:"Either Way",
    description:"Emotional ballad MV. Complete image switch from Baddie era. Yujin's acting widely praised. Currently 50M+ views.",
    media:[
      "https://www.youtube.com/watch?v=REPLACE_WITH_REAL_ID",
      "https://i.pinimg.com/736x/43/ba/0a/43ba0a9d94fa2bfe2c3498be60e70417.jpg",
      "https://i.pinimg.com/736x/f5/61/8b/f5618b7634d19bde308ef61a9bc38e3e.jpg",
    ],
    tags:["MV","Either Way","IVE","ballad"],
  },
  {
    id:5, date:"2024-09-14", title:"IVE SHOW WHAT I HAVE – Seoul Concert", category:"concert", era:"Baddie",
    description:"IVE's first solo concert tour at KSPO Dome. Yujin's solo acoustic 'ELEVEN' stage was the highlight of the night.",
    media:[
      "https://i.pinimg.com/736x/82/3a/0d/823a0d3b6bb81ef51b5c496be11311de.jpg",
      "https://i.pinimg.com/736x/3b/bc/2a/3bbc2a84d8521bc142ab4c88a834b123.jpg",
    ],
    tags:["SHOW WHAT I HAVE","concert","Seoul","solo stage","tour"],
  },
  {
    id:6, date:"2024-08-22", title:"IVE – 'Baddie' MV", category:"music", era:"Baddie",
    description:"Powerful concept shift. Yujin's blonde hair became iconic this era. MV hit 30M views in 24hrs.",
    media:[
      "https://www.youtube.com/watch?v=REPLACE_WITH_REAL_ID",
      "https://i.pinimg.com/736x/43/ba/0a/43ba0a9d94fa2bfe2c3498be60e70417.jpg",
      "https://i.pinimg.com/736x/f5/61/8b/f5618b7634d19bde308ef61a9bc38e3e.jpg",
    ],
    tags:["MV","Baddie","IVE","blonde","concept"],
  },
  {
    id:7, date:"2024-03-27", title:"IVE – 'I AM' MV", category:"music", era:"I AM",
    description:"Empowerment concept from IVE's 1st full album 'I've IVE'. Yujin's center and line distribution praised. 150M+ views.",
    media:[
      "https://www.youtube.com/watch?v=REPLACE_WITH_REAL_ID",
    ],
    tags:["MV","I AM","Ive IVE","1st full album","IVE"],
  },
];

// ================================================================
// F · SUPABASE HELPERS
// "fetchEntries" asks the database for all entries.
// "saveEntry" sends a new entry to be stored.
// ================================================================
const IS_DEMO = SUPABASE_URL.includes("YOUR_PROJECT_ID");

async function fetchEntries() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/entries?select=*&order=date.desc`, {
    headers: { "apikey":SUPABASE_KEY, "Authorization":`Bearer ${SUPABASE_KEY}` }
  });
  if (!res.ok) throw new Error(`Database error: ${res.status}`);
  return res.json();
}

async function saveEntry(entry) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/entries`, {
    method:"POST",
    headers: { "apikey":SUPABASE_KEY, "Authorization":`Bearer ${SUPABASE_KEY}`, "Content-Type":"application/json", "Prefer":"return=representation" },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  return res.json();
}

// ================================================================
// G · SMALL UTILITIES
// ================================================================
const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function getCat(id)  { return CATEGORIES.find(c => c.id === id) || CATEGORIES[1]; }
function fmtDate(d)  { const [y,m,day] = d.split("-"); return `${parseInt(day)} ${MONTHS[parseInt(m)]} ${y}`; }
function groupByMonth(list) {
  const map = {};
  list.forEach(e => { const k = e.date.slice(0,7); if (!map[k]) map[k]=[]; map[k].push(e); });
  return Object.entries(map).sort(([a],[b]) => b.localeCompare(a)).map(([k,items]) => ({ year:k.slice(0,4), month:k.slice(5,7), items }));
}

// ================================================================
// H · MAIN APP
// This is the root component. It manages all the state and
// renders either the Archive view or the Admin view.
// ================================================================
export default function KpopArchive() {

  // Which screen are we on?
  const [view, setView]         = useState("archive");

  // Data from the database
  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [loadErr, setLoadErr]   = useState(null);

  // Archive filter state
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch]       = useState("");

  // Admin: password gate
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw]             = useState("");
  const [pwErr, setPwErr]       = useState(false);

  // Admin: save feedback
  const [saving, setSaving]   = useState(false);
  const [saveOk, setSaveOk]   = useState(false);
  const [saveErr, setSaveErr] = useState(null);

  // Admin: the "Add Entry" form values
  const fileRef = useRef(null); // hidden file input
  const BLANK   = { title:"", date:"", category:"music", era:"", description:"", tags:"", media:[], urlInput:"" };
  const [form, setForm] = useState(BLANK);

  // ── Load entries when the app first opens ──────────────────
  useEffect(() => {
    if (IS_DEMO) {
      setEntries(DEMO_DATA);
      setLoading(false);
    } else {
      fetchEntries()
        .then(d  => { setEntries(d); setLoading(false); })
        .catch(e => { setLoadErr(e.message); setLoading(false); });
    }
  }, []);

  // ── Filter entries based on selected category + search text ─
  const filtered = useMemo(() => entries.filter(e => {
    const matchCat  = activeCat === "all" || e.category === activeCat;
    const q         = search.toLowerCase();
    const matchText = !q
      || e.title.toLowerCase().includes(q)
      || (e.era||"").toLowerCase().includes(q)
      || (e.description||"").toLowerCase().includes(q)
      || (e.tags||[]).some(t => t.toLowerCase().includes(q));
    return matchCat && matchText;
  }), [entries, activeCat, search]);

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);

  // ── Admin: add a pasted URL to the media list ───────────────
  function addMediaUrl() {
    const url = form.urlInput.trim();
    if (!url) return;
    setForm(f => ({ ...f, media:[...f.media, url], urlInput:"" }));
  }

  // ── Admin: add uploaded files from device ───────────────────
  // Creates temporary "blob:" URLs. These work in the current browser
  // session but won't persist when you reload. For permanent media,
  // paste a hosted URL (e.g. from Imgur, Google Drive, or Supabase Storage).
  function handleFileUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const urls = files.map(f => URL.createObjectURL(f));
    setForm(f => ({ ...f, media:[...f.media, ...urls] }));
    e.target.value = "";
  }

  // ── Admin: remove one item from the media preview list ──────
  function removeMedia(i) {
    setForm(f => ({ ...f, media: f.media.filter((_,j) => j !== i) }));
  }

  // ── Admin: save the complete entry ──────────────────────────
  async function handleSave() {
    if (!form.title || !form.date) return;
    setSaving(true); setSaveErr(null);

    const entry = {
      title:       form.title.trim(),
      date:        form.date,
      category:    form.category,
      era:         form.era.trim(),
      description: form.description.trim(),
      tags:        form.tags.split(",").map(t => t.trim()).filter(Boolean),
      media:       form.media,
    };

    try {
      if (IS_DEMO) {
        // Demo mode: add to local state, no real database call
        setEntries(prev => [{ ...entry, id:Date.now() }, ...prev].sort((a,b) => b.date.localeCompare(a.date)));
      } else {
        // Real mode: save to Supabase, then add the returned entry to the list
        const [saved] = await saveEntry(entry);
        setEntries(prev => [saved, ...prev].sort((a,b) => b.date.localeCompare(a.date)));
      }
      setForm(BLANK);
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 4000);
    } catch(e) {
      setSaveErr(e.message);
    }
    setSaving(false);
  }

  // ── Shared inline styles ────────────────────────────────────
  const inp = { width:"100%", boxSizing:"border-box", background:"#0F0F1E", border:"1px solid #1E1E35", borderRadius:8, padding:"8px 12px", color:"#C8C8E8", fontSize:13, outline:"none" };
  const lbl = { fontSize:10, color:"#50508A", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:5, fontWeight:700 };
  function pBtn(on) { return { padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, background: on ? "#A855F7" : "#0F0F1E", color: on ? "#FFF" : "#505080" }; }

  // ================================================================
  // RENDER
  // ================================================================
  return (
    <div style={{ minHeight:"100vh", background:"#07070E", color:"#E4E4F4", fontFamily:"'Inter','Helvetica Neue',sans-serif", fontSize:14 }}>

      {/* ──────────────────────────────────────────────────────
          STICKY HEADER
          Shows the idol's profile photo, name, and nav tabs.
          The search bar and category chips appear below when
          the Archive tab is active.
      ────────────────────────────────────────────────────── */}
      <div style={{ borderBottom:"1px solid #141428", padding:"14px 18px 12px", position:"sticky", top:0, zIndex:10, background:"rgba(7,7,14,0.97)", backdropFilter:"blur(14px)" }}>

        {/* Profile row */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
          <img src={IDOL_IMAGE} alt={IDOL_NAME}
            style={{ width:42, height:42, borderRadius:"50%", objectFit:"cover", border:"2px solid #A855F7", flexShrink:0 }}
          />
          <div style={{ flex:1, minWidth:0 }}>
            {IS_DEMO && (
              <div style={{ fontSize:9, color:"#FBBF24", background:"rgba(251,191,36,0.08)", border:"1px solid rgba(251,191,36,0.18)", padding:"1px 7px", borderRadius:4, display:"inline-block", marginBottom:4, letterSpacing:"0.05em" }}>
                DEMO MODE · add Supabase credentials to go live
              </div>
            )}
            <div style={{ fontSize:16, fontWeight:700, color:"#F0F0FF", letterSpacing:"-0.01em", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{IDOL_NAME}</div>
            <div style={{ fontSize:10, color:"#383858", marginTop:1 }}>Media & Memories Archive</div>
          </div>
          <div style={{ display:"flex", gap:6, flexShrink:0 }}>
            <button onClick={() => setView("archive")} style={{ ...pBtn(view==="archive"), border:`1px solid ${view==="archive"?"#333360":"#141428"}` }}>◈ Archive</button>
            <button onClick={() => setView("admin")}   style={{ ...pBtn(view==="admin"),   border:`1px solid ${view==="admin"  ?"#333360":"#141428"}` }}>⚙ Admin</button>
          </div>
        </div>

        {/* Search + category filter (Archive tab only) */}
        {view === "archive" && (
          <>
            <div style={{ position:"relative", marginBottom:9 }}>
              <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#2A2A50", fontSize:16 }}>⌕</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search titles, tags, eras…" style={{ ...inp, paddingLeft:30 }} />
              {search && <button onClick={() => setSearch("")} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#505080", cursor:"pointer", fontSize:17 }}>×</button>}
            </div>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              {CATEGORIES.map(c => {
                const on = activeCat === c.id;
                return (
                  <button key={c.id} onClick={() => setActiveCat(c.id)} style={{
                    padding:"3px 10px", borderRadius:20, border:"none", cursor:"pointer", fontSize:11, fontWeight:700,
                    background: on ? c.color : "transparent",
                    color:      on ? "#08080F" : c.color,
                    outline:    on ? "none"  : `1px solid ${c.color}44`,
                    transition: "all 0.12s",
                  }}>{c.label}</button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────
          ARCHIVE VIEW
          Shows all entries grouped by month, with media grids.
      ────────────────────────────────────────────────────── */}
      {view === "archive" && (
        <div style={{ maxWidth:680, margin:"0 auto", padding:"20px 16px 60px" }}>

          {loading   && <div style={{ textAlign:"center", padding:60, color:"#3A3A5A" }}>Loading…</div>}
          {loadErr   && <div style={{ textAlign:"center", padding:60, color:"#F87171" }}>{loadErr}</div>}
          {!loading && !loadErr && filtered.length === 0 && (
            <div style={{ textAlign:"center", padding:60, color:"#2A2A48" }}>
              <div style={{ fontSize:28, marginBottom:8 }}>◌</div>
              No entries match your filters.
            </div>
          )}

          {grouped.map(grp => (
            <div key={`${grp.year}-${grp.month}`} style={{ marginBottom:28 }}>

              {/* Month + year divider */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <div style={{ fontSize:10, fontWeight:800, color:"#3A3A64", textTransform:"uppercase", minWidth:24 }}>{MONTHS[parseInt(grp.month)]}</div>
                <div style={{ fontSize:16, fontWeight:800, color:"#8888BC", letterSpacing:"-0.02em" }}>{grp.year}</div>
                <div style={{ flex:1, height:1, background:"#121228" }} />
                <div style={{ fontSize:10, color:"#2A2A48" }}>{grp.items.length} item{grp.items.length !== 1 ? "s":""}</div>
              </div>

              {/* Entry cards */}
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {grp.items.map(entry => {
                  const cat = getCat(entry.category);
                  return (
                    <div key={entry.id} style={{
                      background:"#0C0C1A",
                      border:"1px solid #161628",
                      borderLeft:`3px solid ${cat.dot}`,
                      borderRadius:12,
                      padding:"14px 16px",
                    }}>
                      {/* Card header: category, era, date */}
                      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:7, flexWrap:"wrap" }}>
                        <span style={{ fontSize:10, fontWeight:700, background:`${cat.color}1A`, color:cat.color, padding:"2px 7px", borderRadius:4, letterSpacing:"0.04em" }}>
                          {cat.label.toUpperCase()}
                        </span>
                        {entry.era && (
                          <span style={{ fontSize:10, color:"#484870", background:"#0E0E20", padding:"2px 7px", borderRadius:4 }}>{entry.era}</span>
                        )}
                        <span style={{ fontSize:11, color:"#303055", marginLeft:"auto" }}>{fmtDate(entry.date)}</span>
                      </div>

                      {/* Title */}
                      <div style={{ fontWeight:700, fontSize:15, color:"#E0E0FF", marginBottom:6, lineHeight:1.3 }}>{entry.title}</div>

                      {/* Description */}
                      {entry.description && (
                        <p style={{ fontSize:13, color:"#707098", lineHeight:1.6, margin:"0 0 2px" }}>{entry.description}</p>
                      )}

                      {/* Media grid — the 3-photo preview section */}
                      <MediaGrid media={entry.media || []} />

                      {/* Tags — clicking a tag sets it as the search filter */}
                      {(entry.tags || []).length > 0 && (
                        <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop:10 }}>
                          {entry.tags.map(tag => (
                            <span key={tag}
                              onClick={() => setSearch(tag)}
                              style={{ fontSize:10, color:"#38387A", background:"#0C0C1E", border:"1px solid #1C1C38", padding:"2px 7px", borderRadius:4, cursor:"pointer" }}>
                              #{tag}
                            </span>
                          ))}
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
            <div style={{ borderTop:"1px solid #10101E", paddingTop:20, display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center" }}>
              {CATEGORIES.slice(1).map(c => (
                <div key={c.id} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:c.dot }} />
                  <span style={{ fontSize:10, color:"#2A2A48" }}>{c.label}</span>
                  <span style={{ fontSize:10, color:"#484870", fontWeight:700 }}>{entries.filter(e=>e.category===c.id).length}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────
          ADMIN VIEW
          Password-protected form to add new entries.
          Includes URL pasting and device file upload for media.
      ────────────────────────────────────────────────────── */}
      {view === "admin" && (
        <div style={{ maxWidth:560, margin:"0 auto", padding:"28px 16px 60px" }}>

          {/* Password gate — shown until correct password is entered */}
          {!unlocked ? (
            <div style={{ background:"#0C0C1A", border:"1px solid #161628", borderRadius:14, padding:"36px 28px", textAlign:"center" }}>
              <div style={{ fontSize:30, marginBottom:10 }}>🔐</div>
              <div style={{ fontWeight:700, fontSize:15, color:"#D0D0F0", marginBottom:4 }}>Admin Access</div>
              <div style={{ color:"#484870", fontSize:13, marginBottom:22 }}>Enter your password to add entries to the archive.</div>
              <input
                type="password" value={pw} placeholder="Password"
                onChange={e => setPw(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { if (pw === ADMIN_PASSWORD) { setUnlocked(true); setPwErr(false); } else setPwErr(true); } }}
                style={{ ...inp, textAlign:"center", marginBottom:10 }}
              />
              {pwErr && <div style={{ color:"#F87171", fontSize:12, marginBottom:10 }}>Incorrect password. Try again.</div>}
              <button
                onClick={() => { if (pw === ADMIN_PASSWORD) { setUnlocked(true); setPwErr(false); } else setPwErr(true); }}
                style={{ ...pBtn(true), width:"100%", padding:10 }}
              >Unlock</button>
            </div>

          ) : (
            /* Add Entry form */
            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                <div style={{ fontWeight:700, fontSize:15, color:"#D0D0F0" }}>Add New Entry</div>
                <div style={{ fontSize:11, color:"#38385A" }}>{entries.length} entries total</div>
              </div>

              {saveOk  && <div style={{ background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.22)", borderRadius:8, padding:"10px 14px", marginBottom:14, color:"#34D399", fontSize:13 }}>✓ Entry saved and added to the archive!</div>}
              {saveErr && <div style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.22)", borderRadius:8, padding:"10px 14px", marginBottom:14, color:"#F87171", fontSize:13 }}>✕ {saveErr}</div>}

              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

                {/* Title */}
                <div>
                  <label style={lbl}>Title *</label>
                  <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. IVE – 'Accendio' MV" style={inp} />
                </div>

                {/* Date + Category side by side */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div>
                    <label style={lbl}>Date *</label>
                    <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{ ...inp, colorScheme:"dark" }} />
                  </div>
                  <div>
                    <label style={lbl}>Category *</label>
                    <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={{ ...inp, cursor:"pointer" }}>
                      {CATEGORIES.slice(1).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Era */}
                <div>
                  <label style={lbl}>Era <span style={{ color:"#282848", fontWeight:400 }}>(optional)</span></label>
                  <input value={form.era} onChange={e=>setForm(f=>({...f,era:e.target.value}))} placeholder="e.g. Accendio, Either Way, Baddie" style={inp} />
                </div>

                {/* Description */}
                <div>
                  <label style={lbl}>Description <span style={{ color:"#282848", fontWeight:400 }}>(optional)</span></label>
                  <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Context, view counts, what made it notable…" rows={3} style={{ ...inp, resize:"vertical", lineHeight:1.55 }} />
                </div>

                {/* Tags */}
                <div>
                  <label style={lbl}>Tags <span style={{ color:"#282848", fontWeight:400 }}>(comma-separated)</span></label>
                  <input value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))} placeholder="MV, title track, Accendio, IVE" style={inp} />
                </div>

                {/* ── MEDIA SECTION ── */}
                <div>
                  <label style={lbl}>Media <span style={{ color:"#282848", fontWeight:400 }}>(photos · videos · YouTube · Twitter/X · Instagram · TikTok)</span></label>

                  {/* URL paste input */}
                  <div style={{ display:"flex", gap:7, marginBottom:8 }}>
                    <input
                      value={form.urlInput}
                      onChange={e => setForm(f=>({...f,urlInput:e.target.value}))}
                      onKeyDown={e => e.key === "Enter" && addMediaUrl()}
                      placeholder="Paste any URL — image, YouTube, Twitter, Instagram, TikTok…"
                      style={{ ...inp, flex:1 }}
                    />
                    <button onClick={addMediaUrl} style={{ ...pBtn(true), padding:"8px 14px", flexShrink:0 }}>Add</button>
                  </div>

                  {/* Upload from device button */}
                  <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{ display:"none" }} onChange={handleFileUpload} />
                  <button onClick={() => fileRef.current?.click()} style={{ ...pBtn(false), width:"100%", border:"1px dashed #222240", padding:"9px", marginBottom:6, color:"#505080" }}>
                    📁  Upload photos or videos from your device
                  </button>
                  <div style={{ fontSize:10, color:"#282848", marginBottom:10, lineHeight:1.5 }}>
                    Uploaded files are session-only and won't survive a page refresh. For entries you want to keep forever, paste a hosted link instead (e.g. from Google Drive, Imgur, or your Supabase Storage bucket).
                  </div>

                  {/* Thumbnail preview of added media */}
                  {form.media.length > 0 && (
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:6 }}>
                      {form.media.map((url, i) => {
                        const type = getMediaType(url);
                        const ytId = getYouTubeId(url);
                        const pt   = PTYPE[type];
                        return (
                          <div key={i} style={{ position:"relative", aspectRatio:"1/1", borderRadius:7, overflow:"hidden", border:"1px solid #1A1A30", background:"#0C0C1C" }}>
                            {ytId ? (
                              <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                            ) : type === "image" ? (
                              <img src={url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => e.target.style.opacity="0.1"} />
                            ) : type === "video" ? (
                              <video src={url} muted preload="metadata" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                            ) : pt ? (
                              <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"#10102A" }}>
                                <span style={{ fontSize:9, color:pt.color, fontWeight:700 }}>{pt.label}</span>
                              </div>
                            ) : null}
                            {/* Remove button */}
                            <button onClick={() => removeMedia(i)}
                              style={{ position:"absolute", top:2, right:2, width:17, height:17, background:"rgba(0,0,0,0.75)", border:"none", color:"#FFF", borderRadius:"50%", cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", padding:0, lineHeight:1 }}>×</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Save button */}
                <button
                  onClick={handleSave}
                  disabled={saving || !form.title || !form.date}
                  style={{
                    ...pBtn(!saving && !!form.title && !!form.date),
                    padding:"11px", width:"100%", fontSize:14, marginTop:4,
                    opacity: (saving || !form.title || !form.date) ? 0.35 : 1,
                    cursor:  (saving || !form.title || !form.date) ? "not-allowed" : "pointer",
                  }}
                >
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
