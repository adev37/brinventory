import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const SalesOrderList = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchSalesOrders();
  }, []);

  const fetchSalesOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://brinventorybackend.vercel.app/api/sales-orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders(response.data);
    } catch (error) {
      console.error(error);
      toast.error("❌ Failed to load sales orders");
    }
  };

  const calculateTotalAmount = (items = []) => {
    return items.reduce((total, i) => {
      const qty = parseFloat(i.quantity) || 0;
      const rate = parseFloat(i.rate || i.price) || 0;
      const gst = parseFloat(i.gst) || 0;
      const subtotal = qty * rate;
      const gstAmount = (subtotal * gst) / 100;
      return total + subtotal + gstAmount;
    }, 0);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "Partially Delivered":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-blue-800 mb-4">📃 Sales Orders</h2>

      <div className="overflow-x-auto border shadow rounded-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 border">Order No.</th>
              <th className="px-4 py-3 border">Client</th>
              <th className="px-4 py-3 border">Order Date</th>
              <th className="px-4 py-3 border">Delivery Date</th>
              <th className="px-4 py-3 border">Total Amount</th>
              <th className="px-4 py-3 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-t text-center">
                <td className="px-4 py-2 border">
                  {order.soNumber || order.orderNumber}
                </td>
                <td className="px-4 py-2 border">
                  {order.client?.name || "N/A"}
                </td>
                <td className="px-4 py-2 border">
                  {order.date
                    ? new Date(order.date).toLocaleDateString("en-GB")
                    : "—"}
                </td>
                <td className="px-4 py-2 border">
                  {order.deliveryDate
                    ? new Date(order.deliveryDate).toLocaleDateString("en-GB")
                    : "—"}
                </td>
                <td className="px-4 py-2 border">
                  ₹
                  {order.totalAmount !== undefined
                    ? order.totalAmount.toFixed(2)
                    : calculateTotalAmount(order.items).toFixed(2)}
                </td>
                <td className="px-4 py-2 border">
                  <span
                    className={`px-2 py-1 text-xs rounded font-medium ${getStatusStyle(
                      order.status
                    )}`}>
                    {order.status || "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesOrderList;
