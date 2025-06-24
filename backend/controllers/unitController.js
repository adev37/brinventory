import Unit from "../models/Unit.js";

export const getUnits = async (req, res) => {
  const units = await Unit.find().sort({ name: 1 });
  res.json(units);
};

export const createUnit = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Unit name required" });

  const exists = await Unit.findOne({ name });
  if (exists) return res.status(400).json({ message: "Unit already exists" });

  const unit = new Unit({ name });
  await unit.save();
  res.status(201).json(unit);
};
