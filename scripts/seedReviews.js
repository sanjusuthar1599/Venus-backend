const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const Review = require("../models/Review");
const { googleReviewsSeed } = require("../data/googleReviewsSeed");

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is missing in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  for (const review of googleReviewsSeed) {
    await Review.findOneAndUpdate(
      { google_review_id: review.google_review_id },
      review,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`Reviews seeded. Total: ${await Review.countDocuments()}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
