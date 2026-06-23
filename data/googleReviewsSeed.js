function avatarUrl(name) {
  const encoded = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encoded}&background=b59461&color=fff&size=96&bold=true`;
}

const googleReviewsSeed = [
  {
    author_name: "Vishal Karia",
    author_role: "Local Guide",
    text: "Venus Interiors is easily one of the most exciting interior design firms to watch right now. Their projects are consistently innovative and beautifully executed. It's rare to find a team that has such a strong grasp of both aesthetics and functionality. If you want a space that stands out, I highly suggest reaching out to them!",
    rating: 5,
    author_photo: avatarUrl("Vishal Karia"),
    source: "google",
    google_review_id: "google-vishal-karia",
    published_at: new Date("2025-01-15"),
  },
  {
    author_name: "Priya Nair",
    author_role: "Homeowner",
    text: "We hired Venus Interiors for our 3BHK in Kalyan West and the experience was excellent from start to finish. The team understood our brief, shared 3D layouts quickly, and the modular kitchen plus living room came out exactly as promised. Professional approach and very transparent pricing.",
    rating: 5,
    author_photo: avatarUrl("Priya Nair"),
    source: "google",
    google_review_id: "google-priya-nair",
    published_at: new Date("2024-11-20"),
  },
  {
    author_name: "Rahul Mehta",
    author_role: "Homeowner",
    text: "Outstanding work on our office cabin and reception area. Venus Interiors delivered on time, used quality materials, and the finishing is premium. Their creativity in using space and lighting really impressed our clients. Highly recommended for residential and commercial projects.",
    rating: 5,
    author_photo: avatarUrl("Rahul Mehta"),
    source: "google",
    google_review_id: "google-rahul-mehta",
    published_at: new Date("2024-10-08"),
  },
  {
    author_name: "Sneha Patil",
    author_role: "Homeowner",
    text: "From consultation to handover, communication was clear and honest. They helped us choose textures, colours, and furniture that suit our family lifestyle. The bedroom and wardrobe designs are practical and elegant. Venus Interiors transformed our house into a dream home.",
    rating: 5,
    author_photo: avatarUrl("Sneha Patil"),
    source: "google",
    google_review_id: "google-sneha-patil",
    published_at: new Date("2024-09-12"),
  },
  {
    author_name: "Amit Deshmukh",
    author_role: "Homeowner",
    text: "Very satisfied with the full home interior done by Venus Interiors near Rama Bai Garden. The team is skilled, responsive on WhatsApp, and they completed the project within the agreed timeline. Quality carpentry and neat execution — worth every rupee.",
    rating: 5,
    author_photo: avatarUrl("Amit Deshmukh"),
    source: "google",
    google_review_id: "google-amit-deshmukh",
    published_at: new Date("2024-08-03"),
  },
];

module.exports = { googleReviewsSeed, avatarUrl };
