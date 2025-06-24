// File: /src/pages/reports/StockReport.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const StockReport = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/items", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
    };
    fetchItems();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Stock Report</h2>
      <table className="w-full table-auto border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Item</th>
            <th className="p-2 border">SKU</th>
            <th className="p-2 border">Unit</th>
            <th className="p-2 border">Qty</th>
            <th className="p-2 border">Low Stock</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="p-2 border">{item.name}</td>
              <td className="p-2 border">{item.sku}</td>
              <td className="p-2 border">{item.unit}</td>
              <td className="p-2 border">{item.quantity}</td>
              <td className="p-2 border">
                {item.quantity < item.lowStockThreshold ? (
                  <span className="text-red-500 font-semibold">Yes</span>
                ) : (
                  "No"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockReport;
