const Review = require("../models/Review");
const { googleReviewsSeed } = require("../data/googleReviewsSeed");
const { fetchGooglePlaceReviews } = require("../services/googlePlaces");

const REVIEW_LIMIT = 5;
const SYNC_COOLDOWN_MS = 6 * 60 * 60 * 1000;
let lastSyncAttempt = 0;

function mapReview(doc) {
  return {
    id: doc._id,
    author_name: doc.author_name,
    author_role: doc.author_role,
    text: doc.text,
    rating: doc.rating,
    author_photo: doc.author_photo,
    source: doc.source,
    published_at: doc.published_at,
  };
}

async function ensureSeeded() {
  const count = await Review.countDocuments();
  if (count > 0) return;
  await Review.insertMany(googleReviewsSeed);
}

async function syncFromGoogle({ force = false } = {}) {
  const now = Date.now();
  if (!force && now - lastSyncAttempt < SYNC_COOLDOWN_MS) {
    return { synced: false, reason: "cooldown" };
  }
  lastSyncAttempt = now;

  const remoteReviews = await fetchGooglePlaceReviews();
  if (!remoteReviews?.length) return { synced: false, reason: "no_api_or_reviews" };

  for (const review of remoteReviews) {
    await Review.findOneAndUpdate(
      { google_review_id: review.google_review_id },
      review,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  return { synced: true, count: remoteReviews.length };
}

async function getTopReviews() {
  await ensureSeeded();
  try {
    await syncFromGoogle();
  } catch (err) {
    console.warn("Google review sync skipped:", err.message);
  }

  const reviews = await Review.find({ active: true })
    .sort({ rating: -1, published_at: -1 })
    .limit(REVIEW_LIMIT)
    .lean();

  return reviews.map(mapReview);
}

async function getReviews(req, res) {
  try {
    const reviews = await getTopReviews();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not load reviews" });
  }
}

async function syncReviews(req, res) {
  try {
    await ensureSeeded();
    const result = await syncFromGoogle({ force: true });
    const reviews = await getTopReviews();
    res.json({ ...result, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message || "Sync failed" });
  }
}

module.exports = { getReviews, syncReviews };
