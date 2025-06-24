import Category from "../models/Category.js";

export const getCategories = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
};

export const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name required" });

  const exists = await Category.findOne({ name });
  if (exists) return res.status(400).json({ message: "Already exists" });

  const category = new Category({ name });
  await category.save();
  res.status(201).json(category);
};
