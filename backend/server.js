// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js"; // ✅ Importing clean MongoDB connection

// Routes
// Routes
import itemRoutes from "./routes/itemRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import unitRoutes from "./routes/unitRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import purchaseOrderRoutes from "./routes/purchaseOrderRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import deliveryChallanRoutes from "./routes/deliveryChallanRoutes.js";
import stockLedgerRoutes from "./routes/stockLedgerRoutes.js";
import stockAdjustmentRoutes from "./routes/stockAdjustmentRoutes.js";
import salesInvoiceRoutes from "./routes/salesInvoiceRoutes.js";
import salesReturnRoutes from "./routes/salesReturnRoutes.js";
import goodsReceiptRoutes from "./routes/goodsReceiptRoutes.js";
import purchaseReturnRoutes from "./routes/purchaseReturnRoutes.js";
import vendorQuotationRoutes from "./routes/vendorQuotationRoutes.js";
import salesOrderRoutes from "./routes/salesOrderRoutes.js";
import warehouseRoutes from "./routes/warehouseRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
connectDB();
// ✅ Set up all API routes

app.use("/api/items", itemRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/purchase-returns", purchaseReturnRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/delivery-challans", deliveryChallanRoutes);
app.use("/api/stock-ledger", stockLedgerRoutes);
app.use("/api/stock-adjustments", stockAdjustmentRoutes);
app.use("/api/sales-invoices", salesInvoiceRoutes);
app.use("/api/sales-returns", salesReturnRoutes);
app.use("/api/goods-receipts", goodsReceiptRoutes);
app.use("/api/vendor-quotations", vendorQuotationRoutes);
app.use("/api/sales-orders", salesOrderRoutes);
app.use("/api/warehouses", warehouseRoutes);

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
