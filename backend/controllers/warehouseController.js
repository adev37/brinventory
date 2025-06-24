import Warehouse from "../models/Warehouse.js";

// @desc Create a warehouse
export const createWarehouse = async (req, res) => {
  try {
    const { name, location } = req.body;

    // Check for duplicate name
    const existing = await Warehouse.findOne({ name });
    if (existing)
      return res.status(400).json({ message: "Warehouse already exists" });

    const warehouse = new Warehouse({
      name,
      location,
      createdBy: req.user._id, // optional if authMiddleware is used
    });

    await warehouse.save();
    res.status(201).json(warehouse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all warehouses
export const getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find();
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update a warehouse
export const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location } = req.body;

    const updated = await Warehouse.findByIdAndUpdate(
      id,
      { name, location },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Warehouse not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a warehouse
export const deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Warehouse.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Warehouse not found" });

    res.json({ message: "Warehouse deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
