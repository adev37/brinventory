import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Public Pages
import Login from "./pages/Login";

// Dashboard
import Dashboard from "./pages/Dashboard";

// Users
import AdminUsers from "./pages/users/AdminUsers";
import AddUserForm from "./pages/users/AddUserForm";

// Items
import ItemList from "./pages/inventory/items/ItemList";
import AddItemForm from "./pages/inventory/items/AddItemForm";

// Units
import AddUnitForm from "./pages/units/AddUnitForm";

// Categories
import AddCategoryForm from "./pages/categories/AddCategoryForm";

// Vendors
import VendorList from "./pages/vendors/VendorList";
import AddVendorForm from "./pages/vendors/AddVendorForm";

// Layout
import Layout from "./components/layout/Layout";

// Clients
import ClientList from "./pages/clients/ClientList";
import AddClientForm from "./pages/clients/AddClientForm";

// Purchase
import AddPOForm from "./pages/purchase/AddPurchaseOrder";
import PurchaseOrderList from "./pages/purchase/PurchaseOrderList";
import AddGRNForm from "./pages/purchase/AddGRN";
import AddPurchaseReturn from "./pages/purchase/AddPurchaseReturn";
import PurchaseReturnList from "./pages/purchase/PurchaseReturnList";
import GRNList from "./pages/purchase/GRNList";
import AddVendorQuotation from "./pages/purchase/vendor quotation/AddVendorQuotation";
import VendorQuotationList from "./pages/purchase/vendor quotation/VendorQuotationList";

// Delivery Challans
import AddDeliveryChallan from "./pages/sales/AddDeliveryChallan";
import DeliveryChallanList from "./pages/sales/DeliveryChallanList";

// Sales
import AddSalesInvoice from "./pages/sales/AddSalesInvoice";
import InvoiceList from "./pages/sales/InvoiceList";
import AddSalesOrder from "./pages/sales/AddSalesOrder";
import SalesOrderList from "./pages/sales/SalesOrderList";
import AddSalesReturn from "./pages/sales/AddSalesReturn";
import SalesReturnList from "./pages/sales/SalesReturnList";

// Stock
import CurrentStock from "./pages/inventory/stock/CurrentStock";
import StockByWarehouse from "./pages/inventory/stock/StockByWarehouse";
import TransferStock from "./pages/inventory/stock/TransferStock";

// Reports
import StockReport from "./pages/reports/StockReport";
import SalesReport from "./pages/reports/SalesReport";
import SalesReturnReport from "./pages/reports/SalesReturnReport";

// Stock Adjustments
import AddStockAdjustment from "./pages/inventory/stock-adjustments/AddStockAdjustment";
import StockAdjustmentList from "./pages/inventory/stock-adjustments/StockAdjustmentList";
import SalesInvoiceList from "./pages/sales/SalesInvoiceList";
import AddWarehouse from "./pages/warehouse/AddWarehouse";
import WarehouseList from "./pages/warehouse/WarehouseList";

const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const PrivateRoute = ({ children, roles }) => {
  const user = getUser();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

export default function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/items"
          element={
            <PrivateRoute>
              <Layout>
                <ItemList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/add-item"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <div className="max-w-3xl mx-auto mt-6">
                  <AddItemForm />
                </div>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/vendors"
          element={
            <PrivateRoute roles={["admin"]}>
              <Layout>
                <VendorList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/add-vendor"
          element={
            <PrivateRoute roles={["admin"]}>
              <Layout>
                <div className="max-w-3xl mx-auto mt-6">
                  <AddVendorForm />
                </div>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <PrivateRoute roles={["admin"]}>
              <Layout>
                <ClientList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/add-client"
          element={
            <PrivateRoute roles={["admin"]}>
              <Layout>
                <div className="max-w-3xl mx-auto mt-6">
                  <AddClientForm />
                </div>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/add-unit"
          element={
            <PrivateRoute roles={["admin"]}>
              <Layout>
                <div className="max-w-3xl mx-auto mt-6">
                  <AddUnitForm />
                </div>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/add-category"
          element={
            <PrivateRoute roles={["admin"]}>
              <Layout>
                <div className="max-w-3xl mx-auto mt-6">
                  <AddCategoryForm />
                </div>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute roles={["admin"]}>
              <Layout>
                <AdminUsers />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/add-user"
          element={
            <PrivateRoute roles={["admin"]}>
              <Layout>
                <div className="max-w-3xl mx-auto mt-6">
                  <AddUserForm />
                </div>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/purchase-orders"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <PurchaseOrderList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/purchase-orders/create"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <div className="max-w-5xl mx-auto mt-6">
                  <AddPOForm />
                </div>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/goods-receipt"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <div className="max-w-5xl mx-auto mt-6">
                  <AddGRNForm />
                </div>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/goods-receipt/list"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <div className="max-w-5xl mx-auto mt-6">
                  <GRNList />
                </div>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/purchase-returns"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <PurchaseReturnList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/purchase-returns/create"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <div className="max-w-5xl mx-auto mt-6">
                  <AddPurchaseReturn />
                </div>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/vendor-quotations"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <VendorQuotationList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/vendor-quotations/create"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <div className="max-w-5xl mx-auto mt-6">
                  <AddVendorQuotation />
                </div>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/delivery-challans"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <DeliveryChallanList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/delivery-challans/create"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <div className="max-w-5xl mx-auto mt-6">
                  <AddDeliveryChallan />
                </div>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/sales-orders"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <SalesOrderList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/sales-orders/create"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <div className="max-w-5xl mx-auto mt-6">
                  <AddSalesOrder />
                </div>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/sales-invoices/add"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <AddSalesInvoice />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/sales-invoices"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <SalesInvoiceList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/sales-returns/create"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <AddSalesReturn />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/sales-returns"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <SalesReturnList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/stock"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <div className="max-w-6xl mx-auto mt-6">
                  <StockReport />
                </div>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/sales"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <div className="max-w-6xl mx-auto mt-6">
                  <SalesReport />
                </div>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/returns"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <div className="max-w-6xl mx-auto mt-6">
                  <SalesReturnReport />
                </div>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/stock-adjustments"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <StockAdjustmentList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/stock-adjustments/add"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <AddStockAdjustment />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* {stocks } */}
        <Route
          path="/stock"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <CurrentStock />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/stock-by-warehouse"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <StockByWarehouse />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/stock-transfer"
          element={
            <PrivateRoute roles={["admin", "manager"]}>
              <Layout>
                <TransferStock />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/add-warehouse"
          element={
            <PrivateRoute roles={["admin"]}>
              <Layout>
                <div className="max-w-3xl mx-auto mt-6">
                  <AddWarehouse />
                </div>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/warehouses"
          element={
            <PrivateRoute roles={["admin"]}>
              <Layout>
                <div className="max-w-3xl mx-auto mt-6">
                  <WarehouseList />
                </div>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
