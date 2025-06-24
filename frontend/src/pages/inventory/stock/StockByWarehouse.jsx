import React, { useEffect, useState } from "react";
import axios from "axios";

const StockByWarehouse = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [stock, setStock] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    const res = await axios.get("http://localhost:5000/api/warehouses", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setWarehouses(res.data);
  };

  const fetchStock = async (warehouseId) => {
    const res = await axios.get(
      `http://localhost:5000/api/stocks/by-warehouse?warehouseId=${warehouseId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setStock(res.data || {});
  };

  const handleSelect = (e) => {
    setSelectedWarehouse(e.target.value);
    fetchStock(e.target.value);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🏬 View Stock by Warehouse</h2>

      <select
        className="w-full border p-2 rounded mb-4"
        value={selectedWarehouse}
        onChange={handleSelect}>
        <option value="">-- Select Warehouse --</option>
        {warehouses.map((w) => (
          <option key={w._id} value={w._id}>
            {w.name}
          </option>
        ))}
      </select>

      {Object.keys(stock).length === 0 ? (
        <p className="text-gray-500">No stock data available.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Item</th>
              <th className="p-2 border">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stock).map(([itemName, warehouseData]) => {
              const qty =
                warehouseData[
                  warehouses.find((w) => w._id === selectedWarehouse)?.name
                ] || 0;
              return (
                <tr key={itemName}>
                  <td className="p-2 border">{itemName}</td>
                  <td className="p-2 border">{qty}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StockByWarehouse;
