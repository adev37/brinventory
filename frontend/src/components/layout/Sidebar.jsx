import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import SidebarDropdown from "./SidebarDropdown";
import {
  Home,
  Package,
  Users,
  ClipboardList,
  ShoppingCart,
  BarChart2,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const linkStyle =
    "flex items-center gap-2 px-4 py-2 rounded text-sm font-medium hover:bg-sky-100 transition-colors";
  const activeStyle = "bg-sky-500 text-white";

  return (
    <div className="w-64 h-screen bg-white border-r shadow-sm flex flex-col justify-between">
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-6 text-sky-700 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-sky-500" /> Inventory App
        </h2>

        <nav className="space-y-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${linkStyle} ${isActive ? activeStyle : ""}`
            }>
            <Home className="w-5 h-5" /> Dashboard
          </NavLink>

          <SidebarDropdown
            icon={<Package className="w-5 h-5" />}
            title="Inventory">
            <NavLink to="/items" className={linkStyle}>
              📋 Item Master
            </NavLink>
            <NavLink to="/add-item" className={linkStyle}>
              ➕ New Item Entry
            </NavLink>
            <NavLink to="/stock-adjustments" className={linkStyle}>
              🧾 Stock Adjustment Log
            </NavLink>
            <NavLink to="/stock-adjustments/add" className={linkStyle}>
              ⚙️ Stock Adjustments
            </NavLink>
            <NavLink to="/stock" className={linkStyle}>
              📦 Current Stock
            </NavLink>
            <NavLink to="/stock-transfer" className={linkStyle}>
              🔄 Stock Transfer
            </NavLink>
            <NavLink to="/stock-by-warehouse" className={linkStyle}>
              🏬 Warehouse Stock View
            </NavLink>
          </SidebarDropdown>

          <SidebarDropdown icon={<Users className="w-5 h-5" />} title="Masters">
            <NavLink to="/clients" className={linkStyle}>
              👤 Customers
            </NavLink>
            <NavLink to="/vendors" className={linkStyle}>
              🏢 Suppliers
            </NavLink>
            <NavLink to="/add-unit" className={linkStyle}>
              📐 Units of Measure
            </NavLink>
            <NavLink to="/add-category" className={linkStyle}>
              📂 Product Categories
            </NavLink>
            {user?.role === "admin" && (
              <NavLink to="/admin/users" className={linkStyle}>
                👁️ User Management
              </NavLink>
            )}
            {user?.role === "admin" && (
              <NavLink to="/add-warehouse" className={linkStyle}>
                🏬 Add Warehouse
              </NavLink>
            )}
            <NavLink to="/warehouses" className={linkStyle}>
              🏬 View Warehouse
            </NavLink>
          </SidebarDropdown>

          <SidebarDropdown
            icon={<ClipboardList className="w-5 h-5" />}
            title="Procurement">
            <SidebarDropdown icon="📄" title="Vendor Quotations">
              <NavLink to="/vendor-quotations/create" className={linkStyle}>
                ➕ Create Quotation
              </NavLink>
              <NavLink to="/vendor-quotations" className={linkStyle}>
                📋 Quotation Register
              </NavLink>
            </SidebarDropdown>
            <NavLink to="/purchase-orders/create" className={linkStyle}>
              ➕ Create Purchase Order
            </NavLink>
            <NavLink to="/purchase-orders" className={linkStyle}>
              📋 PO Register
            </NavLink>
            <NavLink to="/goods-receipt" className={linkStyle}>
              📥 Create GRN
            </NavLink>
            <NavLink to="/goods-receipt/list" className={linkStyle}>
              📋 GRN Register
            </NavLink>
            <NavLink to="/purchase-returns/create" className={linkStyle}>
              🔁 Initiate Purchase Return
            </NavLink>
            <NavLink to="/purchase-returns" className={linkStyle}>
              📋 Purchase Return Register
            </NavLink>
          </SidebarDropdown>

          <SidebarDropdown
            icon={<ShoppingCart className="w-5 h-5" />}
            title="Sales">
            <NavLink to="/sales-orders/create" className={linkStyle}>
              ➕ Create Sales Order
            </NavLink>
            <NavLink to="/sales-orders" className={linkStyle}>
              📋 Order Register
            </NavLink>
            <NavLink to="/delivery-challans/create" className={linkStyle}>
              ➕ Create Delivery Note
            </NavLink>
            <NavLink to="/delivery-challans" className={linkStyle}>
              🚚 Challan Register
            </NavLink>
            <NavLink to="/sales-invoices/add" className={linkStyle}>
              🧾 Generate Invoice
            </NavLink>
            <NavLink to="/sales-invoices" className={linkStyle}>
              📋 Invoice Register
            </NavLink>
            <NavLink to="/sales-returns/create" className={linkStyle}>
              🔁 Initiate Sales Return
            </NavLink>
            <NavLink to="/sales-returns" className={linkStyle}>
              📋 Sales Return Register
            </NavLink>
          </SidebarDropdown>

          <SidebarDropdown
            icon={<BarChart2 className="w-5 h-5" />}
            title="Reports">
            <NavLink to="/reports/stock" className={linkStyle}>
              📦 Inventory Report
            </NavLink>
            <NavLink to="/reports/sales" className={linkStyle}>
              📟 Sales Report
            </NavLink>
            <NavLink to="/reports/returns" className={linkStyle}>
              🔁 Returns Report
            </NavLink>
          </SidebarDropdown>
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 text-left px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
