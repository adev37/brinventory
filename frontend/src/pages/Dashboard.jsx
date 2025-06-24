import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#FF8042", "#FFBB28", "#00C49F", "#0088FE", "#A28EFF"];

const Dashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [returnsCount, setReturnsCount] = useState(0);
  const [challanCount, setChallanCount] = useState(0);
  const [salesOrdersCount, setSalesOrdersCount] = useState(0);
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [stockRes, returnRes, challanRes, salesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/stocks", { headers }),
        axios.get("http://localhost:5000/api/sales-returns", { headers }),
        axios.get("http://localhost:5000/api/delivery-challans", { headers }),
        axios.get("http://localhost:5000/api/sales-orders", { headers }),
      ]);

      setStocks(stockRes.data);
      setReturnsCount(returnRes.data.length || 0);
      setChallanCount(challanRes.data.length || 0);
      setSalesOrdersCount(salesRes.data.length || 0);
    } catch (error) {
      console.error("❌ Error loading dashboard data:", error);
    }
  };

  const totalQty = stocks.reduce((sum, s) => sum + s.quantity, 0);
  const lowStockItems = stocks.filter(
    (s) => s.quantity <= (s.item?.lowAlert || 0)
  );
  const activeCategories = new Set(
    stocks.map((s) => s.item?.category?.name).filter(Boolean)
  );

  const barData = stocks.map((s) => ({
    name: s.item?.name || "Unnamed",
    quantity: s.quantity,
  }));

  const categoryCounts = {};
  lowStockItems.forEach((s) => {
    const cat = s.item?.category?.name || "Uncategorized";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const pieData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">📊 Inventory Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome <strong>{user?.name}</strong> ({user?.role})
      </p>

      {/* ✅ Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Items" value={stocks.length} />
        <StatCard title="Total Stock" value={totalQty} />
        <StatCard title="Low Stock Items" value={lowStockItems.length} />
        <StatCard title="Active Categories" value={activeCategories.size} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard title="Sales Orders" value={salesOrdersCount} />
        <StatCard title="Delivery Challans" value={challanCount} />
        <StatCard title="Sales Returns" value={returnsCount} />
      </div>

      {/* ✅ Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 📦 Bar Chart */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-2">📦 Stock by Item</h2>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 italic">No stock data available</p>
          )}
        </div>

        {/* ⚠️ Pie Chart */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-2">
            ⚠️ Low Stock by Category
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#FF8042"
                  label>
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 italic">No low stock categories</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// ✅ Mini Stat Card
const StatCard = ({ title, value }) => (
  <div className="bg-white rounded shadow p-4">
    <p className="text-gray-500 text-sm">{title}</p>
    <h3 className="text-3xl font-bold text-blue-600">{value}</h3>
  </div>
);
