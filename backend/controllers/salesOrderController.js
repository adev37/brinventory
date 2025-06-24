import SalesOrder from "../models/SalesOrder.js";

// @desc    Create a new Sales Order
// @route   POST /api/sales-orders
// @access  Private
export const createSalesOrder = async (req, res) => {
  try {
    const { soNumber, client, items, deliveryDate, remarks, createdBy } =
      req.body;

    if (!soNumber || !client || !items || items.length === 0 || !deliveryDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Calculate totalAmount using rate instead of price
    const totalAmount = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const gst = parseFloat(item.gst) || 0;
      const itemTotal = quantity * rate + (quantity * rate * gst) / 100;
      return sum + itemTotal;
    }, 0);

    const newOrder = new SalesOrder({
      soNumber,
      orderNumber: soNumber, // to maintain uniqueness and avoid null errors
      client,
      items,
      deliveryDate: new Date(deliveryDate),
      remarks,
      totalAmount,
      status: "Pending",
      createdBy,
      date: new Date(),
    });

    await newOrder.save();

    res.status(201).json({
      message: "✅ Sales Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("❌ Error creating sales order:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

// @desc    Get all Sales Orders
// @route   GET /api/sales-orders
// @access  Private
export const getAllSalesOrders = async (req, res) => {
  try {
    const orders = await SalesOrder.find()
      .populate("client", "name email")
      .populate("items.item", "name pricePerUnit");

    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch sales orders", details: error.message });
  }
};

// @desc    Get Sales Order by ID
// @route   GET /api/sales-orders/:id
// @access  Private
export const getSalesOrderById = async (req, res) => {
  try {
    const order = await SalesOrder.findById(req.params.id)
      .populate("client", "name email")
      .populate("items.item", "name pricePerUnit");

    if (!order) {
      return res.status(404).json({ error: "Sales order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch sales order", details: error.message });
  }
};

// @desc    Get Undelivered Sales Orders
// @route   GET /api/sales-orders/undelivered
// @access  Private
export const getUndeliveredSalesOrders = async (req, res) => {
  try {
    const orders = await SalesOrder.find({
      status: { $in: ["Pending", "Partially Delivered"] },
    })
      .populate("client")
      .populate("items.item");

    const withRemaining = orders
      .map((order) => {
        const remainingItems = order.items
          .map((i) => ({
            item: i.item,
            quantity: i.quantity,
            delivered: i.delivered || 0,
            remaining: i.quantity - (i.delivered || 0),
            rate: i.rate,
            gst: i.gst,
          }))
          .filter((i) => i.remaining > 0);

        if (remainingItems.length === 0) return null;

        return {
          _id: order._id,
          orderNumber: order.soNumber || order.orderNumber,
          client: order.client,
          items: remainingItems,
          deliveryDate: order.deliveryDate,
        };
      })
      .filter((o) => o !== null);

    res.json(withRemaining);
  } catch (err) {
    console.error("Error in getUndeliveredSalesOrders:", err);
    res.status(500).json({ error: "Failed to fetch undelivered SOs" });
  }
};
