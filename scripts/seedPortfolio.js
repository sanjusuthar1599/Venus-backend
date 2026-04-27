/**
 * Resets portfolio data and seeds Mumbai-area interior projects:
 * - Deletes all Post documents
 * - Clears uploads/images and uploads/videos
 * - 12 image projects (2 Unsplash interior photos each, 1920×1080)
 * - 6 video projects (Pexels HD interior walkthrough clips)
 *
 * Run from venusApi: npm run seed
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const Post = require("../models/Post");

const ROOT = path.join(__dirname, "..");
const IMG_DIR = path.join(ROOT, "uploads", "images");
const VID_DIR = path.join(ROOT, "uploads", "videos");

/**
 * Unsplash interior / furniture / spaces — URLs verified HTTP 200 (1920×1080 crop).
 * Per Unsplash license, attribution is recommended on the public site.
 */
const UNSPLASH_INTERIOR = [
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1920&h=1080&q=85",
  "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1920&h=1080&q=85",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1920&h=1080&q=85",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&h=1080&q=85",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&h=1080&q=85",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1920&h=1080&q=85",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&h=1080&q=85",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1920&h=1080&q=85",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&h=1080&q=85",
  "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1920&h=1080&q=85",
  "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1920&h=1080&q=85",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1920&h=1080&q=85",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1920&h=1080&q=85",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1920&h=1080&q=85",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1920&h=1080&q=85",
  "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1920&h=1080&q=85",
];

/** Pexels HD clips (verified GET 200) — interior / room / space visuals. */
const PEXELS_VIDEOS = [
  { fileId: 3045163, fps: 25 },
  { fileId: 3255271, fps: 25 },
  { fileId: 3209828, fps: 25 },
  { fileId: 3195442, fps: 25 },
  { fileId: 3188953, fps: 25 },
  { fileId: 3163534, fps: 30 },
];

const IMAGE_PROJECTS = [
  {
    project_name: "Altamount Road — Full Home Furnishing",
    project_location: "Altamount Road, Mumbai",
    project_type: "Residential",
  },
  {
    project_name: "Juhu Sea-Facing Apartment — Living & Bedrooms",
    project_location: "Juhu, Mumbai",
    project_type: "Residential",
  },
  {
    project_name: "Powai Lake View — Modular Kitchen & Wardrobes",
    project_location: "Powai, Mumbai",
    project_type: "Residential",
  },
  {
    project_name: "Bandra Heritage Flat — Restoration & Styling",
    project_location: "Bandra West, Mumbai",
    project_type: "Residential",
  },
  {
    project_name: "BKC Grade-A Office — Reception & Workfloors",
    project_location: "Bandra Kurla Complex, Mumbai",
    project_type: "Commercial",
  },
  {
    project_name: "Lower Parel — Coworking Lounge & Meeting Pods",
    project_location: "Lower Parel, Mumbai",
    project_type: "Commercial",
  },
  {
    project_name: "Andheri East — Furniture Retail Experience Studio",
    project_location: "Andheri East, Mumbai",
    project_type: "Commercial",
  },
  {
    project_name: "Worli — Corporate Boardroom & Breakout Zones",
    project_location: "Worli, Mumbai",
    project_type: "Commercial",
  },
  {
    project_name: "Colaba Boutique Hotel — Lobby & Lounge Seating",
    project_location: "Colaba, Mumbai",
    project_type: "Hospitality",
  },
  {
    project_name: "Thane West — Fine Dining — Banquette & Lighting",
    project_location: "Thane West (Mumbai MMR)",
    project_type: "Hospitality",
  },
  {
    project_name: "Malad West — Spa Reception & Therapy Suites",
    project_location: "Malad West, Mumbai",
    project_type: "Hospitality",
  },
  {
    project_name: "Navi Mumbai (Vashi) — Café — Furniture & Millwork",
    project_location: "Vashi, Navi Mumbai",
    project_type: "Hospitality",
  },
];

const VIDEO_PROJECTS = [
  {
    project_name: "Goregaon High-Rise — Living Room Walkthrough",
    project_location: "Goregaon East, Mumbai",
    project_type: "Residential",
    pexels: PEXELS_VIDEOS[0],
  },
  {
    project_name: "Khar West — Show Apartment — Interior Tour",
    project_location: "Khar West, Mumbai",
    project_type: "Residential",
    pexels: PEXELS_VIDEOS[1],
  },
  {
    project_name: "Seepz — Office Pantry & Collaboration Zone",
    project_location: "SEEPZ, Andheri East, Mumbai",
    project_type: "Commercial",
    pexels: PEXELS_VIDEOS[2],
  },
  {
    project_name: "Sakinaka — Show Office — Workstations & Storage",
    project_location: "Sakinaka, Mumbai",
    project_type: "Commercial",
    pexels: PEXELS_VIDEOS[3],
  },
  {
    project_name: "Fort — Heritage Hotel — Room & Corridor Styling",
    project_location: "Fort, Mumbai",
    project_type: "Hospitality",
    pexels: PEXELS_VIDEOS[4],
  },
  {
    project_name: "Juhu — Rooftop Restaurant — Seating Layout",
    project_location: "Juhu Tara Road, Mumbai",
    project_type: "Hospitality",
    pexels: PEXELS_VIDEOS[5],
  },
];

function clearDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    return;
  }
  for (const name of fs.readdirSync(dir)) {
    fs.unlinkSync(path.join(dir, name));
  }
}

async function downloadToFile(url, destPath) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      Accept: "*/*",
      "User-Agent":
        "Mozilla/5.0 (compatible; VenusInteriorSeed/1.0; +https://example.local)",
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buf);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  if (!process.env.MONGO_URI) {
    console.error("Missing MONGO_URI in .env");
    process.exit(1);
  }

  clearDir(IMG_DIR);
  clearDir(VID_DIR);

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to database.");

  const removed = await Post.deleteMany({});
  console.log(`Removed ${removed.deletedCount} existing project(s).`);

  let created = 0;
  let imgIndex = 0;

  for (let i = 0; i < IMAGE_PROJECTS.length; i++) {
    const p = IMAGE_PROJECTS[i];
    const urlA = UNSPLASH_INTERIOR[imgIndex % UNSPLASH_INTERIOR.length];
    imgIndex += 1;
    const urlB = UNSPLASH_INTERIOR[imgIndex % UNSPLASH_INTERIOR.length];
    imgIndex += 1;

    const nameA = `${Date.now()}-mumbai-${i}-a.jpg`;
    const nameB = `${Date.now()}-mumbai-${i}-b.jpg`;

    process.stdout.write(
      `[img ${i + 1}/${IMAGE_PROJECTS.length}] ${p.project_name}… `
    );
    try {
      await downloadToFile(urlA, path.join(IMG_DIR, nameA));
      await sleep(200);
      await downloadToFile(urlB, path.join(IMG_DIR, nameB));
      await Post.create({
        project_name: p.project_name,
        project_location: p.project_location,
        project_type: p.project_type,
        project_images: [nameA, nameB],
        project_video: null,
      });
      created += 1;
      console.log("ok");
      await sleep(300);
    } catch (e) {
      console.error("failed:", e.message);
    }
  }

  for (let i = 0; i < VIDEO_PROJECTS.length; i++) {
    const p = VIDEO_PROJECTS[i];
    const { fileId, fps } = p.pexels;
    const url = `https://videos.pexels.com/video-files/${fileId}/${fileId}-hd_1920_1080_${fps}fps.mp4`;
    const vname = `${Date.now()}-mumbai-vid-${i}.mp4`;

    process.stdout.write(
      `[vid ${i + 1}/${VIDEO_PROJECTS.length}] ${p.project_name}… `
    );
    try {
      await downloadToFile(url, path.join(VID_DIR, vname));
      await Post.create({
        project_name: p.project_name,
        project_location: p.project_location,
        project_type: p.project_type,
        project_images: [],
        project_video: vname,
      });
      created += 1;
      console.log("ok");
      await sleep(400);
    } catch (e) {
      console.error("failed:", e.message);
    }
  }

  await mongoose.disconnect();
  console.log(
    `\nDone. Inserted ${created} projects (${IMAGE_PROJECTS.length} image + ${VIDEO_PROJECTS.length} video).`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
