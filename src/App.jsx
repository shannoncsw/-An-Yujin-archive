import React, { useState } from 'react';

// ================================================================
//  SECTION A · YOUR SETTINGS
// ================================================================
const IDOL_NAME      = "안유진 · An Yujin"; 
const IDOL_IMAGE     = "https://i.pinimg.com/736x/82/3a/0d/823a0d3b6bb81ef51b5c496be11311de.jpg"; 
const ARCHIVE_TITLE  = "Memories & Media Archive";

// ================================================================
//  SECTION B · ARCHIVE DATA ITEMS
// ================================================================
const ARCHIVE_DATA = [
  {
    id: 1,
    date: "2026.06.15",
    title: "Example Entry: Mixed Media Collection",
    description: "This entry shows how you can mix different links together. Click thumbnails to test their native platform players!",
    media: [
      "https://i.pinimg.com/736x/43/ba/0a/43ba0a9d94fa2bfe2c3498be60e70417.jpg", 
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ", 
      "https://x.com/IVEstarship/status/1785234910293410000", 
      "https://www.instagram.com/p/C6XYZ12345/" 
    ]
  },
  {
    id: 2,
    date: "2026.05.20",
    title: "Example Entry: Pure Photo Gallery",
    description: "Standard direct image links will load fully cropped previews natively inside the gallery grid.",
    media: [
      "https://i.pinimg.com/736x/3b/bc/2a/3bbc2a84d8521bc142ab4c88a834b123.jpg",
      "https://i.pinimg.com/736x/f5/61/8b/f5618b7634d19bde308ef61a9bc38e3e.jpg"
    ]
  }
];

// ================================================================
//  SECTION C · UNIVERSAL MEDIA GRID + LIGHTBOX COMPONENT 
// ================================================================
const MediaGrid = ({ mediaUrls }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!mediaUrls || mediaUrls.length === 0 || mediaUrls[0] === "") return null;

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getTwitterId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i);
    return match ? match[1] : null;
  };

  const getInstagramId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:instagram\.com)\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i);
    return match ? match[1] : null;
  };

  const getTikTokId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:tiktok\.com)\/@[\w.-]+\/video\/(\d+)/i);
    return match ? match[1] : null;
  };

  const isRawVideo = (url) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url.trim());
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (activeIndex > 0) setActiveIndex(activeIndex - 1);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (activeIndex < mediaUrls.length - 1) setActiveIndex(activeIndex + 1);
  };

  return (
    <div style={{ marginTop: 14, marginBottom: 6 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {mediaUrls.slice(0, 3).map((url, index) => {
          const ytId = getYouTubeId(url);
          const tweetId = getTwitterId(url);
          const igId = getInstagramId(url);
          const ttId = getTikTokId(url);
          const isVid = isRawVideo(url);
          
          const isVideoPlatform = ytId || tweetId || igId || ttId || isVid;
          const isLastVisible = index === 2;
          const remainingCount = mediaUrls.length - 3;

          let platformLabel = "Video";
          if (tweetId) platformLabel = "Twitter";
          if (igId) platformLabel = "Instagram";
          if (ttId) platformLabel = "TikTok";

          return (
            <div 
              key={index} 
              onClick={(e) => { e.stopPropagation(); setActiveIndex(index); }}
              style={{
                position: "relative",
                aspectRatio: "1 / 1",
                background: "#121225",
                borderRadius: 8,
                overflow: "hidden",
                cursor: "pointer",
                border: "1px solid #202035",
              }}
            >
              {ytId ? (
                <img 
                  src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                  alt="YouTube Thumbnail" 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : isVid ? (
                <video src={url.trim()} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted preload="metadata" />
              ) : (tweetId || igId || ttId) ? (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#1b1b3a", padding: 8 }}>
                  <span style={{ fontSize: 11, color: "#A0A0C0", fontWeight: "600" }}>{platformLabel}</span>
                </div>
              ) : (
                <img 
                  src={url.trim()} 
                  alt="Archive pic" 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=Image+Error'; }}
                />
              )}

              {isVideoPlatform && !isLastVisible && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.2)" }}>
                  <div style={{ background: "#A855F7", padding: 8, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg style={{ width: 12, height: 12, fill: "#FFF" }} viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              )}

              {isLastVisible && remainingCount > 0 && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#FFF", fontWeight: "bold" }}>
                  <span style={{ fontSize: 16 }}>+{remainingCount}</span>
                  <span style={{ fontSize: 9, textTransform: "uppercase", color: "#B0B0C5" }}>More</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeIndex !== null && (() => {
        const currentUrl = mediaUrls[activeIndex];
        const ytId = getYouTubeId(currentUrl);
        const tweetId = getTwitterId(currentUrl);
        const igId = getInstagramId(currentUrl);
        const ttId = getTikTokId(currentUrl);
        const isVid = isRawVideo(currentUrl);

        const isVerticalEmbed = igId || ttId || tweetId;

        return (
          <div 
            style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.92)", padding: 16, backdropFilter: "blur(8px)" }}
            onClick={() => setActiveIndex(null)}
          >
            <button 
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#A0A0C0", fontSize: 36, cursor: "pointer", zIndex: 120 }}
              onClick={() => setActiveIndex(null)}
            >
              ×
            </button>

            {activeIndex > 0 && (
              <button onClick={handlePrev} style={{ position: "absolute", left: 16, zIndex: 110, background: "rgba(25,25,40,0.6)", border: "none", color: "#FFF", padding: "12px 16px", borderRadius: "50%", cursor: "pointer" }}>❮</button>
            )}

            {activeIndex < mediaUrls.length - 1 && (
              <button onClick={handleNext} style={{ position: "absolute", right: 16, zIndex: 110, background: "rgba(25,25,40,0.6)", border: "none", color: "#FFF", padding: "12px 16px", borderRadius: "50%", cursor: "pointer" }}>❯</button>
            )}

            <div 
              style={{ 
                position: "relative", 
                width: "100%", 
                maxWidth: isVerticalEmbed ? 480 : 860, 
                aspectRatio: isVerticalEmbed ? "auto" : "16 / 9", 
                height: isVerticalEmbed ? "80vh" : "auto",
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                background: "#000", 
                borderRadius: 12, 
                overflow: "hidden" 
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {ytId ? (
                <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1`} style={{ width: "100%", height: "100%", border: "none" }} allow="autoplay; encrypted-media" allowFullScreen />
              ) : tweetId ? (
                <iframe src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=dark`} style={{ width: "100%", height: "100%", border: "none" }} />
              ) : igId ? (
                <iframe src={`https://www.instagram.com/p/${igId}/embed/captioned/`} style={{ width: "100%", height: "100%", border: "none", background: "#FFF" }} scrolling="no" />
              ) : ttId ? (
                <iframe src={`https://www.tiktok.com/embed/v2/${ttId}`} style={{ width: "100%", height: "100%", border: "none" }} />
              ) : isVid ? (
                <video src={currentUrl.trim()} controls autoPlay style={{ maxWidth: "100%", maxHeight: "100%" }} />
              ) : (
                <img src={currentUrl.trim()} alt="Display Panel" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

// ================================================================
//  SECTION d · MAIN WRAPPER CONTAINER ARCHITECTURE
// ================================================================
export default function KpopArchiveApp() {
  return (
    <div style={{ background: "#0b0b16", color: "#e2e2e9", minHeight: "100vh", padding: "40px 20px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, paddingBottom: 20, borderBottom: "1px solid #1f1f38" }}>
          <img 
            src={IDOL_IMAGE} 
            alt={IDOL_NAME} 
            style={{ width: 70, height: 70, borderRadius: "50%", objectFit: "cover", border: "2px solid #a855f7" }} 
          />
          <div>
            <h1 style={{ fontSize: 24, fontWeight: "bold", margin: 0, color: "#fff" }}>{IDOL_NAME}</h1>
            <p style={{ fontSize: 14, color: "#9a9aaf", margin: "4px 0 0 0" }}>{ARCHIVE_TITLE}</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {ARCHIVE_DATA.map((item) => (
            <div 
              key={item.id} 
              style={{ background: "#131326", border: "1px solid #1f1f38", borderRadius: 12, padding: 20, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.2)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <h2 style={{ fontSize: 18, fontWeight: "600", margin: 0, color: "#fff" }}>{item.title}</h2>
                <span style={{ fontSize: 12, color: "#a855f7", fontWeight: "bold", fontFamily: "monospace" }}>{item.date}</span>
              </div>
              <p style={{ fontSize: 14, color: "#b4b4c6", lineHeight: "1.5", margin: "0 0 14px 0" }}>{item.description}</p>
              
              <MediaGrid mediaUrls={item.media} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

