import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import SidebarDropdown from "./SidebarDropdown";

const Sidebar = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const linkStyle =
    "block px-4 py-2 rounded hover:bg-blue-100 transition-colors";
  const activeStyle = "bg-blue-500 text-white";

  return (
    <div className="w-64 h-screen bg-white border-r shadow-sm flex flex-col justify-between">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-6 text-blue-800">
          📊 Inventory App
        </h2>

        <nav className="space-y-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${linkStyle} ${isActive ? activeStyle : ""}`
            }>
            🏠 Dashboard
          </NavLink>

          {/* 📦 Inventory Management */}
          <SidebarDropdown icon="📦" title="Inventory">
            <NavLink to="/items" className="block px-4 py-2 hover:bg-gray-100">
              📋 Item Master
            </NavLink>
            <NavLink
              to="/add-item"
              className="block px-4 py-2 hover:bg-gray-100">
              ➕ New Item Entry
            </NavLink>
            <NavLink
              to="/stock-adjustments"
              className="block px-4 py-2 hover:bg-gray-100">
              🧾 Stock Adjustment Log
            </NavLink>
            <NavLink
              to="/stock-adjustments/add"
              className="block px-4 py-2 hover:bg-gray-100">
              ⚙️ Stock Adjustments
            </NavLink>
            <NavLink to="/stock" className="block px-4 py-2 hover:bg-gray-100">
              📦 Stock Ledger
            </NavLink>
            <NavLink
              to="/stock-transfer"
              className="block px-4 py-2 hover:bg-gray-100">
              🔄 Stock Transfer
            </NavLink>
            <NavLink
              to="/stock-by-warehouse"
              className="block px-4 py-2 hover:bg-gray-100">
              🏬 Warehouse Stock View
            </NavLink>
          </SidebarDropdown>

          {/* 👥 Master Data */}
          <SidebarDropdown icon="👥" title="Master Data">
            <NavLink
              to="/clients"
              className="block px-4 py-2 hover:bg-gray-100">
              👤 Customers
            </NavLink>
            <NavLink
              to="/vendors"
              className="block px-4 py-2 hover:bg-gray-100">
              🏢 Suppliers
            </NavLink>
            <NavLink
              to="/add-unit"
              className="block px-4 py-2 hover:bg-gray-100">
              📐 Units of Measure
            </NavLink>
            <NavLink
              to="/add-category"
              className="block px-4 py-2 hover:bg-gray-100">
              📂 Product Categories
            </NavLink>
            {user?.role === "admin" && (
              <NavLink
                to="/admin/users"
                className="block px-4 py-2 hover:bg-gray-100">
                👁️ User Management
              </NavLink>
            )}
            {user?.role === "admin" && (
              <NavLink
                to="/add-warehouse"
                className="block px-4 py-2 hover:bg-gray-100">
                🏬 Add Warehouse
              </NavLink>
            )}
            <NavLink
              to="/warehouses"
              className="block px-4 py-2 hover:bg-gray-100">
              🏬 View Warehouse
            </NavLink>
          </SidebarDropdown>

          {/* 📁 Procurement */}
          <SidebarDropdown icon="📁" title="Procurement">
            <SidebarDropdown icon="📄" title="Vendor Quotations">
              <NavLink
                to="/vendor-quotations/create"
                className="block px-4 py-2 hover:bg-gray-100">
                ➕ Create Quotation
              </NavLink>
              <NavLink
                to="/vendor-quotations"
                className="block px-4 py-2 hover:bg-gray-100">
                📋 Quotation Register
              </NavLink>
            </SidebarDropdown>
            <NavLink
              to="/purchase-orders/create"
              className="block px-4 py-2 hover:bg-gray-100">
              ➕ Create Purchase Order
            </NavLink>
            <NavLink
              to="/purchase-orders"
              className="block px-4 py-2 hover:bg-gray-100">
              📋 PO Register
            </NavLink>
            <NavLink
              to="/goods-receipt"
              className="block px-4 py-2 hover:bg-gray-100">
              📥 Create GRN
            </NavLink>
            <NavLink
              to="/goods-receipt/list"
              className="block px-4 py-2 hover:bg-gray-100">
              📋 GRN Register
            </NavLink>
            <NavLink
              to="/purchase-returns/create"
              className="block px-4 py-2 hover:bg-gray-100">
              🔁 Initiate Purchase Return
            </NavLink>
            <NavLink
              to="/purchase-returns"
              className="block px-4 py-2 hover:bg-gray-100">
              📋 Purchase Return Register
            </NavLink>
          </SidebarDropdown>

          {/* 📐 Sales & Distribution */}
          <SidebarDropdown icon="📐" title="Sales">
            <NavLink
              to="/sales-orders/create"
              className="block px-4 py-2 hover:bg-gray-100">
              ➕ Create Sales Order
            </NavLink>
            <NavLink
              to="/sales-orders"
              className="block px-4 py-2 hover:bg-gray-100">
              📋 Order Register
            </NavLink>
            <NavLink
              to="/delivery-challans/create"
              className="block px-4 py-2 hover:bg-gray-100">
              ➕ Create Delivery Note
            </NavLink>
            <NavLink
              to="/delivery-challans"
              className="block px-4 py-2 hover:bg-gray-100">
              🚚 Challan Register
            </NavLink>
            <NavLink
              to="/sales-invoices/add"
              className="block px-4 py-2 hover:bg-gray-100">
              🧾 Generate Invoice
            </NavLink>
            <NavLink
              to="/sales-invoices"
              className="block px-4 py-2 hover:bg-gray-100">
              📋 Invoice Register
            </NavLink>
            <NavLink
              to="/sales-returns/create"
              className="block px-4 py-2 hover:bg-gray-100">
              🔁 Initiate Sales Return
            </NavLink>
            <NavLink
              to="/sales-returns"
              className="block px-4 py-2 hover:bg-gray-100">
              📋 Sales Return Register
            </NavLink>
          </SidebarDropdown>

          {/* 📊 Business Reports */}
          <SidebarDropdown icon="📊" title="Reports">
            <NavLink
              to="/reports/stock"
              className="block px-4 py-2 hover:bg-gray-100">
              📦 Inventory Report
            </NavLink>
            <NavLink
              to="/reports/sales"
              className="block px-4 py-2 hover:bg-gray-100">
              📟 Sales Report
            </NavLink>
            <NavLink
              to="/reports/returns"
              className="block px-4 py-2 hover:bg-gray-100">
              🔁 Returns Report
            </NavLink>
          </SidebarDropdown>
        </nav>
      </div>

      {/* Logout */}
      <div className="p-4">
        <button
          onClick={logout}
          className="w-full text-left px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200">
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
