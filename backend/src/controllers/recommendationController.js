import {
  getPersonalizedRecommendations,
  getFrequentlyBoughtTogether,
  getColdStartRecommendations,
} from "../services/recommendation/recommendationService.js";

// ─── GET /v1/api/recommendations/for-you ─────────────────────────────────────
// Yêu cầu: user đã đăng nhập (auth middleware đã chạy trước)
// Logic: Nếu user có lịch sử → Personalized; nếu không → Cold Start
export const getForYou = async (req, res) => {
  try {
    // JWT payload dùng field "userId" (xem authService.js dòng 92)
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    const limit = parseInt(req.query.limit) || 8;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const recommendations = await getPersonalizedRecommendations(userId, limit);

    // Nếu không đủ kết quả từ personalized → bổ sung từ cold start
    if (recommendations.length < limit) {
      const coldStart = await getColdStartRecommendations(limit);
      const existingIds = new Set(recommendations.map((p) => p._id.toString()));
      const extras = coldStart.filter(
        (p) => !existingIds.has(p._id.toString())
      );
      recommendations.push(...extras.slice(0, limit - recommendations.length));
    }

    return res.status(200).json({
      success: true,
      data: recommendations,
      type: "personalized",
    });
  } catch (err) {
    console.error("[RecommendationController] getForYou:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// ─── GET /v1/api/recommendations/bought-together/:productId ──────────────────
// Public — không cần đăng nhập
// Logic: Item co-occurrence từ đơn hàng; fallback sang similar products
export const getBoughtTogether = async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit) || 6;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });
    }

    const results = await getFrequentlyBoughtTogether(productId, limit);

    return res.status(200).json({
      success: true,
      data: results,
      type: "bought-together",
    });
  } catch (err) {
    console.error("[RecommendationController] getBoughtTogether:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// ─── GET /v1/api/recommendations/popular ─────────────────────────────────────
// Public — dành cho user chưa đăng nhập (cold start)
export const getPopular = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const results = await getColdStartRecommendations(limit);

    return res.status(200).json({
      success: true,
      data: results,
      type: "popular",
    });
  } catch (err) {
    console.error("[RecommendationController] getPopular:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
