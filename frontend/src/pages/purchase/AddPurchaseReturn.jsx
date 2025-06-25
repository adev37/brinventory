import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AddPurchaseReturn = () => {
  const [grns, setGrns] = useState([]);
  const [selectedGRN, setSelectedGRN] = useState("");
  const [items, setItems] = useState([]);
  const [remarks, setRemarks] = useState("");

  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch eligible GRNs and warehouses
  useEffect(() => {
    const fetchGRNsAndReturns = async () => {
      try {
        const [grnsRes, returnsRes] = await Promise.all([
          axios.get(
            "https://brinventorybackend.vercel.app/api/goods-receipts",
            { headers }
          ),
          axios.get(
            "https://brinventorybackend.vercel.app/api/purchase-returns",
            { headers }
          ),
        ]);

        const allGRNs = grnsRes.data;
        const allReturns = returnsRes.data;

        const returnMap = {};
        for (const ret of allReturns) {
          if (!ret.grn || !ret.grn._id) continue;
          for (const item of ret.returnedItems) {
            const key = `${ret.grn._id}_${item.item?._id}`;
            if (!item.item?._id) continue;
            returnMap[key] = (returnMap[key] || 0) + item.returnQty;
          }
        }

        const eligibleGRNs = allGRNs.filter((grn) =>
          grn.receivedItems.some((ri) => {
            const returnedQty = returnMap[`${grn._id}_${ri.item?._id}`] || 0;
            return returnedQty < ri.receivedQty;
          })
        );

        setGrns(eligibleGRNs);
      } catch (err) {
        toast.error("❌ Failed to load eligible GRNs");
        console.error(err);
      }
    };

    const fetchWarehouses = async () => {
      try {
        const res = await axios.get(
          "https://brinventorybackend.vercel.app/api/warehouses",
          {
            headers,
          }
        );
        setWarehouses(res.data);
      } catch (err) {
        toast.error("❌ Failed to load warehouses");
        console.error(err);
      }
    };

    fetchGRNsAndReturns();
    fetchWarehouses();
  }, []);

  const handleGRNChange = async (grnId) => {
    setSelectedGRN(grnId);
    setItems([]);

    try {
      const [grnRes, returnsRes] = await Promise.all([
        axios.get(
          `https://brinventorybackend.vercel.app/api/goods-receipts/${grnId}`,
          {
            headers,
          }
        ),
        axios.get(
          "https://brinventorybackend.vercel.app/api/purchase-returns",
          { headers }
        ),
      ]);

      const grnData = grnRes.data;

      const relatedReturns = returnsRes.data.filter(
        (r) => r.grn && r.grn._id === grnId
      );

      const returnMap = {};
      for (const ret of relatedReturns) {
        for (const item of ret.returnedItems) {
          if (!item.item?._id) continue;
          const key = item.item._id;
          returnMap[key] = (returnMap[key] || 0) + item.returnQty;
        }
      }

      const itemList = grnData.receivedItems
        .map((ri) => {
          if (!ri.item?._id) return null;
          const received = ri.receivedQty;
          const returned = returnMap[ri.item._id] || 0;
          const remaining = received - returned;
          if (remaining <= 0) return null;

          return {
            item: ri.item._id,
            name: ri.item.name,
            returnQty: 1,
            reason: "",
            maxQty: remaining,
          };
        })
        .filter(Boolean);

      setItems(itemList);
    } catch (err) {
      toast.error("❌ Failed to load GRN details");
      console.error(err);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = field === "returnQty" ? Number(value) : value;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        grn: selectedGRN,
        warehouse: warehouseId, // ✅ required by backend
        returnedItems: items.map(({ item, returnQty, reason }) => ({
          item,
          returnQty,
          reason,
        })),
        remarks,
        createdBy: localStorage.getItem("userId"),
      };

      await axios.post(
        "https://brinventorybackend.vercel.app/api/purchase-returns",
        payload,
        {
          headers,
        }
      );

      toast.success("✅ Purchase return created!");
      setSelectedGRN("");
      setWarehouseId("");
      setItems([]);
      setRemarks("");
    } catch (err) {
      const serverMessage = err.response?.data?.message;

      if (serverMessage?.includes("Insufficient stock")) {
        toast.error("❌ Insufficient stock for one or more items.");
      } else {
        toast.error(serverMessage || "❌ Failed to submit return");
      }

      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">
        📤 Create Purchase Return
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 shadow rounded space-y-4">
        <div>
          <label className="block font-semibold mb-1">Select GRN</label>
          <select
            value={selectedGRN}
            onChange={(e) => handleGRNChange(e.target.value)}
            className="w-full border p-2 rounded"
            required>
            <option value="">-- Select GRN --</option>
            {grns.map((grn) => (
              <option key={grn._id} value={grn._id}>
                GRN #{grn._id.slice(-5).toUpperCase()} - PO-
                {grn.purchaseOrder?._id?.slice(-8) || "UNKNOWN"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Select Warehouse</label>
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="w-full border p-2 rounded"
            required>
            <option value="">-- Select Warehouse --</option>
            {warehouses.map((wh) => (
              <option key={wh._id} value={wh._id}>
                {wh.name} ({wh.location})
              </option>
            ))}
          </select>
        </div>

        {items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-6 gap-2 items-center">
            <div className="col-span-2 font-medium">
              {item.name}
              <span className="text-sm text-gray-500 block">
                (Remaining: {item.maxQty})
              </span>
            </div>

            <input
              type="number"
              min={1}
              max={item.maxQty}
              value={item.returnQty}
              onChange={(e) =>
                handleItemChange(idx, "returnQty", e.target.value)
              }
              className="border p-2 rounded col-span-1"
              required
            />

            <input
              type="text"
              value={item.reason}
              onChange={(e) => handleItemChange(idx, "reason", e.target.value)}
              className="border p-2 rounded col-span-3"
              placeholder="Reason (optional)"
            />
          </div>
        ))}

        <div>
          <label className="block font-semibold mb-1">Remarks (optional)</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full border p-2 rounded"></textarea>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Submit Return
        </button>
      </form>
    </div>
  );
};

export default AddPurchaseReturn;

//? ==========
// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const AddPurchaseReturn = () => {
//   const [grnList, setGrnList] = useState([]);
//   const [warehouseList, setWarehouseList] = useState([]);

//   const [selectedGRN, setSelectedGRN] = useState(null);
//   const [warehouseId, setWarehouseId] = useState("");
//   const [returnedItems, setReturnedItems] = useState([]);
//   const [remarks, setRemarks] = useState("");

//   useEffect(() => {
//     // Fetch GRNs with pending return items
//     axios
//       .get("/api/goods-receipts/pending-returns")
//       .then((res) => setGrnList(res.data))
//       .catch(() => alert("Failed to load GRNs"));

//     // Fetch warehouses (optional if you want to show name/location)
//     axios
//       .get("/api/warehouses")
//       .then((res) => setWarehouseList(res.data))
//       .catch(() => alert("Failed to load warehouses"));
//   }, []);

//   const handleGRNChange = (e) => {
//     const grnId = e.target.value;
//     const grn = grnList.find((g) => g._id === grnId);
//     setSelectedGRN(grn);

//     if (grn) {
//       setWarehouseId(grn.warehouse?._id || grn.warehouse); // handle both populated and unpopulated
//       const prefilledItems = grn.receivedItems.map((ri) => ({
//         item: ri.item._id || ri.item,
//         returnQty: 1,
//         reason: "",
//         maxQty: ri.remainingQty,
//         name: ri.item.name,
//       }));
//       setReturnedItems(prefilledItems);
//     }
//   };

//   const handleQtyChange = (index, qty) => {
//     const updated = [...returnedItems];
//     updated[index].returnQty = qty;
//     setReturnedItems(updated);
//   };

//   const handleReasonChange = (index, reason) => {
//     const updated = [...returnedItems];
//     updated[index].reason = reason;
//     setReturnedItems(updated);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedGRN || !warehouseId || returnedItems.length === 0) {
//       return alert("Missing required fields.");
//     }

//     const payload = {
//       grn: selectedGRN._id,
//       warehouse: warehouseId,
//       remarks,
//       returnedItems: returnedItems.map((ri) => ({
//         item: ri.item,
//         returnQty: ri.returnQty,
//         reason: ri.reason || "",
//       })),
//     };

//     try {
//       const res = await axios.post("/api/purchase-returns", payload);
//       alert("✅ Purchase return submitted.");
//       // Clear form
//       setSelectedGRN(null);
//       setReturnedItems([]);
//       setWarehouseId("");
//       setRemarks("");
//     } catch (err) {
//       console.error(err);
//       alert(err.response?.data?.message || "Return failed");
//     }
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-semibold mb-3">📦 Create Purchase Return</h2>

//       <form onSubmit={handleSubmit}>
//         <div className="mb-4">
//           <label>Select GRN</label>
//           <select
//             value={selectedGRN?._id || ""}
//             onChange={handleGRNChange}
//             className="w-full border rounded px-2 py-1"
//           >
//             <option value="">-- Select GRN --</option>
//             {grnList.map((grn) => (
//               <option key={grn._id} value={grn._id}>
//                 GRN #{grn._id.slice(-5)} - PO-{grn.purchaseOrder?.poNumber}
//               </option>
//             ))}
//           </select>
//         </div>

//         {warehouseId && (
//           <div className="mb-4">
//             <label>Select Warehouse</label>
//             <select
//               value={warehouseId}
//               disabled
//               className="w-full border rounded px-2 py-1 bg-gray-100"
//             >
//               <option value="">-- Select Warehouse --</option>
//               {warehouseList.map((w) => (
//                 <option key={w._id} value={w._id}>
//                   {w.name} ({w.location})
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}

//         {returnedItems.map((item, index) => (
//           <div key={index} className="mb-3">
//             <label className="block font-semibold">
//               {item.name}
//               <span className="text-sm text-gray-500">
//                 {" "}
//                 (Remaining: {item.maxQty})
//               </span>
//             </label>
//             <div className="flex gap-2">
//               <input
//                 type="number"
//                 value={item.returnQty}
//                 min="1"
//                 max={item.maxQty}
//                 onChange={(e) =>
//                   handleQtyChange(index, parseInt(e.target.value))
//                 }
//                 className="w-1/4 border rounded px-2 py-1"
//               />
//               <input
//                 type="text"
//                 value={item.reason}
//                 onChange={(e) => handleReasonChange(index, e.target.value)}
//                 placeholder="Reason (optional)"
//                 className="w-3/4 border rounded px-2 py-1"
//               />
//             </div>
//           </div>
//         ))}

//         <div className="mb-3">
//           <label>Remarks (optional)</label>
//           <textarea
//             value={remarks}
//             onChange={(e) => setRemarks(e.target.value)}
//             className="w-full border rounded px-2 py-1"
//           />
//         </div>

//         <button
//           type="submit"
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           Submit Return
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AddPurchaseReturn;
