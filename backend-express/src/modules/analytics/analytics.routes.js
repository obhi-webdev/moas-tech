import { Router } from "express";
import { PageView } from "../../models/page-view.model.js";
import { Order } from "../../models/order.model.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../middlewares/admin.middleware.js";

const router = Router();
const recent = new Map();
const visitorLimits = new Map();
const sourceLimits = new Map();

function allowRequest(store, key, limit, windowMs) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.startedAt >= windowMs) {
    store.set(key, { startedAt: now, count: 1 });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count += 1;
  return true;
}

function cleanupLimits() {
  const now = Date.now();

  for (const store of [recent, visitorLimits, sourceLimits]) {
    for (const [key, value] of store) {
      const timestamp =
        typeof value === "number" ? value : value.startedAt;

      if (now - timestamp > 120000) {
        store.delete(key);
      }
    }
  }
}

function classify(path) {
  if (path === "/") return "home";
  if (path === "/shop") return "shop";
  if (/^\/product\/[a-z0-9-]+$/i.test(path)) return "product";
  if (/^\/category\/[a-z0-9-]+$/i.test(path)) return "category";
  if (/^\/lp\/[a-z0-9-]+$/i.test(path)) return "landing";
  return "other";
}

router.post("/view", async (req, res, next) => {
  try {
    const { visitorId, path } = req.body || {};

    if (
      typeof visitorId !== "string" ||
      !/^[a-f0-9-]{36}$/i.test(visitorId) ||
      typeof path !== "string" ||
      path.length > 300 ||
      !/^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(path) ||
      path.startsWith("/admin")
    ) {
      return res.status(400).json({ message: "Invalid tracking event" });
    }

    const now = Date.now();

    if (
      visitorLimits.size > 20000 ||
      sourceLimits.size > 20000
    ) {
      cleanupLimits();
    }

    const source = req.ip || req.socket.remoteAddress || "unknown";

    if (!allowRequest(sourceLimits, source, 120, 60000)) {
      return res.status(429).json({
        message: "Too many tracking requests"
      });
    }

    if (!allowRequest(visitorLimits, visitorId, 30, 60000)) {
      return res.status(429).json({
        message: "Visitor tracking limit exceeded"
      });
    }

    // In-memory duplicate suppression for accidental rapid repeat events.
    const key = `${visitorId}:${path}`;
    const last = recent.get(key);

    if (last && now - last < 10000) {
      return res.status(202).json({ success: true });
    }

    if (recent.size > 10000) {
      for (const [k, t] of recent) {
        if (now - t > 60000) recent.delete(k);
      }
      if (recent.size > 10000) recent.clear();
    }

    recent.set(key, now);

    await PageView.create({
      visitorId,
      path,
      pageType: classify(path)
    });

    return res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/admin/overview",
  requireAuth,
  requireAdmin,
  async (req, res, next) => {
    try {
      const days = Number(req.query.days || 7);

      if (![7, 30, 90].includes(days)) {
        return res.status(400).json({
          message: "Days must be 7, 30 or 90"
        });
      }

      const start = new Date();
      start.setUTCHours(0, 0, 0, 0);
      start.setUTCDate(start.getUTCDate() - days + 1);

      const match = { createdAt: { $gte: start } };

      const [
        views,
        visitors,
        pageTypes,
        daily,
        topPages,
        orders
      ] = await Promise.all([
        PageView.countDocuments(match),

        PageView.distinct("visitorId", match),

        PageView.aggregate([
          { $match: match },
          { $group: { _id: "$pageType", views: { $sum: 1 } } }
        ]),

        PageView.aggregate([
          { $match: match },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                  timezone: "UTC"
                }
              },
              views: { $sum: 1 },
              visitors: { $addToSet: "$visitorId" }
            }
          },
          {
            $project: {
              views: 1,
              visitors: { $size: "$visitors" }
            }
          },
          { $sort: { _id: 1 } }
        ]),

        PageView.aggregate([
          { $match: match },
          {
            $group: {
              _id: "$path",
              views: { $sum: 1 }
            }
          },
          { $sort: { views: -1 } },
          { $limit: 10 }
        ]),

        Order.find(match)
          .select("total status createdAt")
          .lean()
      ]);

      const validOrders = orders.filter(
        o => o.status !== "cancelled"
      );

      const deliveredOrders = orders.filter(
        o => o.status === "delivered"
      );

      const revenue = deliveredOrders.reduce(
        (sum, o) => sum + Number(o.total || 0),
        0
      );

      const typeCounts = Object.fromEntries(
        pageTypes.map(item => [item._id, item.views])
      );

      const dailyMap = new Map(
        daily.map(item => [item._id, item])
      );

      const trend = [];

      for (let i = 0; i < days; i++) {
        const date = new Date(start);
        date.setUTCDate(start.getUTCDate() + i);

        const day = date.toISOString().slice(0, 10);
        const item = dailyMap.get(day);

        trend.push({
          date: day,
          views: item?.views || 0,
          visitors: item?.visitors || 0
        });
      }

      res.json({
        success: true,
        days,
        summary: {
          views,
          uniqueVisitors: visitors.length,
          orders: validOrders.length,
          revenue,
          conversionRate: visitors.length
            ? Number(
                (validOrders.length / visitors.length * 100).toFixed(2)
              )
            : 0,
          productViews: typeCounts.product || 0,
          landingViews: typeCounts.landing || 0
        },
        trend,
        topPages: topPages.map(p => ({
          path: p._id,
          views: p.views
        }))
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
