// controllers/salesInvoiceController.js
import SalesInvoice from "../models/SalesInvoice.js";
import DeliveryChallan from "../models/DeliveryChallan.js";

// Utility to generate next invoice number
const generateInvoiceNumber = async () => {
  const lastInvoice = await SalesInvoice.findOne().sort({ createdAt: -1 });
  if (!lastInvoice || !lastInvoice.invoiceNumber) return "IN-001";

  const lastNumber = parseInt(lastInvoice.invoiceNumber.split("-")[1]) || 0;
  const nextNumber = lastNumber + 1;
  return `IN-${String(nextNumber).padStart(3, "0")}`;
};

// @desc    Create Invoice from Delivery Challan
// @route   POST /api/sales-invoices
// @access  Private
export const createInvoice = async (req, res) => {
  try {
    const { deliveryChallan } = req.body;

    if (!deliveryChallan) {
      return res
        .status(400)
        .json({ message: "Delivery Challan ID is required" });
    }

    const dc = await DeliveryChallan.findById(deliveryChallan)
      .populate("client", "name")
      .populate({
        path: "items.item",
        model: "Item",
        select: "name pricePerUnit",
      });

    if (!dc) {
      return res.status(404).json({ message: "Delivery Challan not found" });
    }

    const invoiceNumber = await generateInvoiceNumber();

    const items = dc.items.map((i) => ({
      item: i.item._id,
      quantity: i.quantity,
      price: i.item.pricePerUnit || 0,
    }));

    const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

    const invoice = await SalesInvoice.create({
      invoiceNumber,
      deliveryChallan: dc._id,
      client: dc.client._id,
      items,
      totalAmount,
      warehouse: dc.warehouse || null, // Ensure warehouse is passed
      status: "Finalized",
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "✅ Invoice created from Delivery Challan",
      invoice,
    });
  } catch (err) {
    console.error("❌ Error in createInvoice:", err);
    res.status(500).json({
      message: "Invoice creation failed",
      error: err.message,
    });
  }
};

// @desc    Get All Invoices
// @route   GET /api/sales-invoices
// @access  Private
export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await SalesInvoice.find()
      .populate("client", "name")
      .populate("deliveryChallan", "transportDetails date")
      .populate("items.item", "name")
      .populate("warehouse", "name location");

    res.json(invoices);
  } catch (err) {
    console.error("❌ Error in getAllInvoices:", err);
    res.status(500).json({
      message: "Fetching invoices failed",
      error: err.message,
    });
  }
};

// @desc    Get Available Delivery Challans (not already invoiced)
// @route   GET /api/sales-invoices/available-dcs
// @access  Private
export const getAvailableDeliveryChallans = async (req, res) => {
  try {
    const invoicedDCs = await SalesInvoice.find().distinct("deliveryChallan");

    const availableDCs = await DeliveryChallan.find({
      _id: { $nin: invoicedDCs },
    })
      .populate("client", "name")
      .populate({
        path: "items.item",
        model: "Item",
        select: "name pricePerUnit",
      });

    res.json(availableDCs);
  } catch (err) {
    console.error("❌ Error in getAvailableDeliveryChallans:", err);
    res.status(500).json({ message: "Failed to fetch delivery challans" });
  }
};

// @desc    Get Next Invoice Number
// @route   GET /api/sales-invoices/next-number
// @access  Private
export const getNextInvoiceNumber = async (req, res) => {
  try {
    const lastInvoice = await SalesInvoice.findOne({})
      .sort({ createdAt: -1 })
      .select("invoiceNumber");

    let nextNumber = "IN-001";

    if (lastInvoice?.invoiceNumber) {
      const match = lastInvoice.invoiceNumber.match(/IN-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10) + 1;
        nextNumber = `IN-${String(num).padStart(3, "0")}`;
      }
    }

    res.json({ invoiceNumber: nextNumber });
  } catch (err) {
    console.error("❌ Error in getNextInvoiceNumber:", err);
    res.status(500).json({ message: "Failed to generate invoice number" });
  }
};
