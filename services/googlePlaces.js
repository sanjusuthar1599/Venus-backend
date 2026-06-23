const { avatarUrl } = require("../data/googleReviewsSeed");

async function fetchGooglePlaceReviews() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return null;

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "reviews,rating,userRatingCount",
    },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Google Places API error (${res.status}): ${errText || res.statusText}`);
  }

  const data = await res.json();
  const reviews = Array.isArray(data.reviews) ? data.reviews : [];

  return reviews
    .map((review, index) => {
      const authorName =
        review.authorAttribution?.displayName ||
        review.authorAttribution?.name ||
        `Google Reviewer ${index + 1}`;
      const text =
        review.text?.text || review.originalText?.text || review.text || "";

      return {
        author_name: authorName,
        author_role: "Google Review",
        text: String(text).trim(),
        rating: Number(review.rating) || 5,
        author_photo: review.authorAttribution?.photoUri || avatarUrl(authorName),
        source: "google",
        google_review_id:
          review.name ||
          `google-${authorName.toLowerCase().replace(/\s+/g, "-")}-${index}`,
        published_at: review.publishTime ? new Date(review.publishTime) : new Date(),
        active: true,
      };
    })
    .filter((r) => r.text.length > 0)
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return new Date(b.published_at) - new Date(a.published_at);
    })
    .slice(0, 5);
}

module.exports = { fetchGooglePlaceReviews };
