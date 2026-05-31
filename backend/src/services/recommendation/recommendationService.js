import mongoose from "mongoose";
import Product from "../../models/product.js";
import User from "../../models/user.js";
import Order from "../../models/order.js";
import Review from "../../models/review.js";

// ─── Pipeline lookup chung để populate ảnh & category ─────────────────────
const productLookupPipeline = [
  {
    $lookup: {
      from: "categories",
      localField: "category",
      foreignField: "_id",
      as: "category",
    },
  },
  { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: "productimages",
      localField: "_id",
      foreignField: "product",
      as: "images",
    },
  },
  {
    $project: {
      name: 1,
      price: 1,
      discount: 1,
      sold: 1,
      views: 1,
      slug: 1,
      isNew: 1,
      isHot: 1,
      status: 1,
      "category._id": 1,
      "category.name": 1,
      images: 1,
    },
  },
];

// ─── 1. PERSONALIZED RECOMMENDATION ──────────────────────────────────────────
/**
 * Kết hợp Content-Based + User-Based Collaborative Filtering
 * Input:  userId (string), limit (number)
 * Output: danh sách sản phẩm được gợi ý, sắp theo điểm giảm dần
 */
export const getPersonalizedRecommendations = async (userId, limit = 8) => {
  try {
    const userObjId = new mongoose.Types.ObjectId(userId);

    // ── Bước 1: Lấy thông tin hành vi của user hiện tại ──────────────────
    const user = await User.findById(userObjId)
      .select("viewedProducts favProducts")
      .lean();

    if (!user) return [];

    // Tìm các product đã mua từ đơn hàng
    const userOrders = await Order.find({ user: userObjId })
      .select("items")
      .lean();
    const purchasedIds = userOrders.flatMap((o) =>
      o.items.map((i) => i.product.toString())
    );

    // Tổng hợp tất cả product user đã tương tác
    const interactedIds = [
      ...new Set([
        ...(user.viewedProducts || []).map((id) => id.toString()),
        ...(user.favProducts || []).map((id) => id.toString()),
        ...purchasedIds,
      ]),
    ];

    // ── Bước 2: Content-Based — phân tích sở thích từ sản phẩm đã xem ────
    let preferredCategoryIds = [];
    let preferredPriceMin = 0;
    let preferredPriceMax = Infinity;

    if (interactedIds.length > 0) {
      const interactedObjIds = interactedIds.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
      const interactedProducts = await Product.find({
        _id: { $in: interactedObjIds },
      })
        .select("category price")
        .lean();

      // Đếm category hay gặp nhất
      const categoryCounts = {};
      interactedProducts.forEach((p) => {
        if (p.category) {
          const catStr = p.category.toString();
          categoryCounts[catStr] = (categoryCounts[catStr] || 0) + 1;
        }
      });
      preferredCategoryIds = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id]) => new mongoose.Types.ObjectId(id));

      // Tính khoảng giá trung bình ±40%
      const prices = interactedProducts.map((p) => p.price).filter(Boolean);
      if (prices.length > 0) {
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        preferredPriceMin = avgPrice * 0.6;
        preferredPriceMax = avgPrice * 1.4;
      }
    }

    // ── Bước 3: Collaborative Filtering — tìm user tương tự ─────────────
    let collaborativeProductIds = [];

    if (interactedIds.length > 0) {
      const interactedObjIds = interactedIds.map(
        (id) => new mongoose.Types.ObjectId(id)
      );

      // Tìm users khác đã xem ít nhất 1 sản phẩm giống ta
      const similarUsers = await User.find({
        _id: { $ne: userObjId },
        $or: [
          { viewedProducts: { $in: interactedObjIds } },
          { favProducts: { $in: interactedObjIds } },
        ],
      })
        .select("viewedProducts favProducts")
        .limit(30)
        .lean();

      // Tổng hợp sản phẩm mà những user tương tự thích
      const collaborativeMap = {};
      similarUsers.forEach((su) => {
        const suProducts = [
          ...(su.viewedProducts || []),
          ...(su.favProducts || []),
        ];
        suProducts.forEach((pid) => {
          const pidStr = pid.toString();
          if (!interactedIds.includes(pidStr)) {
            collaborativeMap[pidStr] = (collaborativeMap[pidStr] || 0) + 1;
          }
        });
      });

      collaborativeProductIds = Object.entries(collaborativeMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([id]) => new mongoose.Types.ObjectId(id));
    }

    // ── Bước 4: Tổng hợp và tính điểm ────────────────────────────────────
    const excludeObjIds = interactedIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const candidates = await Product.aggregate([
      {
        $match: {
          status: "available",
          _id: { $nin: excludeObjIds },
        },
      },
      {
        $addFields: {
          score: {
            $add: [
              // +3 nếu thuộc category ưa thích
              {
                $cond: [
                  {
                    $in: [
                      "$category",
                      preferredCategoryIds.length > 0
                        ? preferredCategoryIds
                        : [],
                    ],
                  },
                  3,
                  0,
                ],
              },
              // +2 nếu trong khoảng giá ưa thích
              {
                $cond: [
                  {
                    $and: [
                      { $gte: ["$price", preferredPriceMin] },
                      { $lte: ["$price", preferredPriceMax] },
                    ],
                  },
                  2,
                  0,
                ],
              },
              // +2 nếu là sản phẩm collaborative
              {
                $cond: [
                  {
                    $in: [
                      "$_id",
                      collaborativeProductIds.length > 0
                        ? collaborativeProductIds
                        : [],
                    ],
                  },
                  2,
                  0,
                ],
              },
              // +1 điểm cơ sở từ lượt xem (normalize)
              { $divide: [{ $ifNull: ["$views", 0] }, 100] },
              // +1 điểm từ đã bán
              { $divide: [{ $ifNull: ["$sold", 0] }, 50] },
            ],
          },
        },
      },
      { $sort: { score: -1 } },
      { $limit: limit },
      ...productLookupPipeline,
    ]);

    return candidates;
  } catch (err) {
    console.error("[RecommendationService] getPersonalized error:", err);
    return [];
  }
};

// ─── 2. FREQUENTLY BOUGHT TOGETHER ───────────────────────────────────────────
/**
 * Item Co-occurrence: sản phẩm thường được mua cùng nhau trong 1 đơn
 * Input:  productId (string), limit (number)
 * Output: danh sách sản phẩm hay mua kèm
 */
export const getFrequentlyBoughtTogether = async (productId, limit = 6) => {
  try {
    const productObjId = new mongoose.Types.ObjectId(productId);

    // Tìm tất cả đơn hàng chứa sản phẩm này
    const ordersWithProduct = await Order.find({
      "items.product": productObjId,
    })
      .select("items")
      .lean();

    if (ordersWithProduct.length === 0) return [];

    // Đếm tần suất các sản phẩm xuất hiện cùng
    const coOccurrenceMap = {};
    ordersWithProduct.forEach((order) => {
      order.items.forEach((item) => {
        const pid = item.product.toString();
        if (pid !== productId) {
          coOccurrenceMap[pid] = (coOccurrenceMap[pid] || 0) + 1;
        }
      });
    });

    if (Object.keys(coOccurrenceMap).length === 0) return [];

    // Sắp xếp theo tần suất
    const topIds = Object.entries(coOccurrenceMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => new mongoose.Types.ObjectId(id));

    const products = await Product.aggregate([
      {
        $match: {
          _id: { $in: topIds },
          status: "available",
        },
      },
      ...productLookupPipeline,
    ]);

    // Giữ thứ tự theo tần suất
    const productMap = {};
    products.forEach((p) => {
      productMap[p._id.toString()] = p;
    });
    return topIds
      .map((id) => productMap[id.toString()])
      .filter(Boolean);
  } catch (err) {
    console.error("[RecommendationService] getFrequentlyBoughtTogether error:", err);
    return [];
  }
};

// ─── 3. COLD START — POPULAR PRODUCTS ─────────────────────────────────────────
/**
 * Fallback cho user mới: kết hợp top sold, top viewed, mới nhất
 * Đảm bảo đa dạng danh mục
 * Input:  limit (number)
 * Output: danh sách sản phẩm phổ biến
 */
export const getColdStartRecommendations = async (limit = 8) => {
  try {
    // Lấy nhiều hơn để đảm bảo đa dạng danh mục
    const fetchLimit = limit * 3;

    const [topSold, topViewed, newest] = await Promise.all([
      // Top bán chạy
      Product.aggregate([
        { $match: { status: "available" } },
        { $sort: { sold: -1 } },
        { $limit: fetchLimit },
        ...productLookupPipeline,
      ]),
      // Top xem nhiều
      Product.aggregate([
        { $match: { status: "available" } },
        { $sort: { views: -1 } },
        { $limit: fetchLimit },
        ...productLookupPipeline,
      ]),
      // Mới nhất
      Product.aggregate([
        { $match: { status: "available" } },
        { $sort: { createdAt: -1 } },
        { $limit: fetchLimit },
        ...productLookupPipeline,
      ]),
    ]);

    // Gán điểm trọng số
    const scoreMap = {};

    topSold.forEach((p, idx) => {
      const id = p._id.toString();
      scoreMap[id] = (scoreMap[id] || { product: p, score: 0 });
      scoreMap[id].score += (fetchLimit - idx) * 3; // sold = trọng số 3
    });

    topViewed.forEach((p, idx) => {
      const id = p._id.toString();
      if (!scoreMap[id]) scoreMap[id] = { product: p, score: 0 };
      scoreMap[id].score += (fetchLimit - idx) * 2; // views = trọng số 2
    });

    newest.forEach((p, idx) => {
      const id = p._id.toString();
      if (!scoreMap[id]) scoreMap[id] = { product: p, score: 0 };
      scoreMap[id].score += (fetchLimit - idx) * 1; // new = trọng số 1
    });

    // Sắp xếp theo điểm
    const sorted = Object.values(scoreMap).sort((a, b) => b.score - a.score);

    // Đảm bảo đa dạng danh mục: mỗi category tối đa 2 sản phẩm
    const result = [];
    const categoryCount = {};

    for (const { product } of sorted) {
      if (result.length >= limit) break;
      const catId = product.category?._id?.toString() || "unknown";
      if ((categoryCount[catId] || 0) < 2) {
        result.push(product);
        categoryCount[catId] = (categoryCount[catId] || 0) + 1;
      }
    }

    // Nếu chưa đủ limit thì bổ sung không cần filter
    if (result.length < limit) {
      for (const { product } of sorted) {
        if (result.length >= limit) break;
        if (!result.find((p) => p._id.toString() === product._id.toString())) {
          result.push(product);
        }
      }
    }

    return result;
  } catch (err) {
    console.error("[RecommendationService] getColdStart error:", err);
    return [];
  }
};
