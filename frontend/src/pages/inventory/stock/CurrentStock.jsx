// pages/inventory/stock/CurrentStock.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";

const CurrentStock = () => {
  const [stock, setStock] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/stocks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStock(res.data);
      } catch (err) {
        console.error("Failed to fetch stock", err);
      }
    };

    fetchStock();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📦 Current Stock</h2>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Item Name</th>
            <th className="border p-2">SKU</th>
            <th className="border p-2">Available Qty</th>
            <th className="border p-2">Unit</th>
            <th className="border p-2">Low Alert</th>
          </tr>
        </thead>
        <tbody>
          {stock.map((item) => (
            <tr key={item._id}>
              <td className="border p-2">{item.name}</td>
              <td className="border p-2">{item.sku}</td>
              <td
                className={`border p-2 font-semibold ${
                  item.quantity <= item.lowAlert ? "text-red-600" : ""
                }`}>
                {item.quantity}
              </td>
              <td className="border p-2">{item.unit}</td>
              <td className="border p-2">{item.lowAlert}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CurrentStock;
