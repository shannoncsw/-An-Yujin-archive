import React, { useState } from 'react';

// ================================================================
//  SECTION A · YOUR SETTINGS
// ================================================================
const IDOL_NAME      = "안유진 · An Yujin"; 
const IDOL_IMAGE     = "https://i.pinimg.com/736x/82/3a/0d/823a0d3b6bb81ef51b5c496be11311de.jpg"; // Paste your direct Pinterest image link here
const ARCHIVE_TITLE  = "Memories & Media Archive";

// ================================================================
//  SECTION B · ARCHIVE DATA ITEMS
//  Mix and match images, YouTube, Twitter, Instagram, and TikTok links!
// ================================================================
const ARCHIVE_DATA = [
  {
    id: 1,
    date: "2026.06.15",
    title: "Example Entry: Mixed Media Collection",
    description: "This entry shows how you can mix different links together. Click thumbnails to test their native platform players!",
    media: [
      "https://i.pinimg.com/736x/43/ba/0a/43ba0a9d94fa2bfe2c3498be60e70417.jpg", // Photo
      "https://www.youtube.com/watch?v=k8Z6qA2wFns", // YouTube Video
      "https://x.com/IVEstarship/status/1785234910293410000", // Twitter Link
      "https://www.instagram.com/p/C6XYZ12345/" // Instagram Link
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

  // 1. Parse YouTube Links
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // 2. Parse Twitter / X Links
  const getTwitterId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i);
    return match ? match[1] : null;
  };

  // 3. Parse Instagram Links (Posts and Reels)
  const getInstagramId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:instagram\.com)\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i);
    return match ? match[1] : null;
  };

  // 4. Parse TikTok Links
  const getTikTokId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:tiktok\.com)\/@[\w.-]+\/video\/(\d+)/i);
    return match ? match[1] : null;
  };

  // 5. Parse Raw Video Files (.mp4, .mov, etc.)
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
      {/* THUMBNAIL GRID LAYOUT */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {mediaUrls.slice(0, 3).map((url, index) => {
          const ytId = getYouTubeId(url);
          const tweetId = getTwitterId(url);
          const igId = getInstagramId(url);
          const ttId = getTikTok
