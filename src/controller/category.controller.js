const Category = require("../model/Category");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.createCategory = catchAsync(async (req, res, next) => {
  const category = await Category.create({
    name: req.body.name,
    description: req.body.description,
    created_by: req.user._id,
  });
  res.status(201).json({ success: true, data: { category } });
});

exports.getCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find({ created_by: req.user._id, archived: false });
  res.status(200).json({ success: true, results: categories.length, data: { categories } });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const update = { updated_by: req.user._id };
  if (req.body.name) update.name = req.body.name;
  if (req.body.description !== undefined) update.description = req.body.description;

  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, created_by: req.user._id, archived: false },
    update,
    { new: true, runValidators: true }
  );
  if (!category) {
    return next(new AppError("Kategori tidak ditemukan atau kamu tidak memiliki akses", 404));
  }
  res.status(200).json({ success: true, data: { category } });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, created_by: req.user._id, archived: false },
    { archived: true, updated_by: req.user._id },
    { new: true }
  );
  if (!category) {
    return next(new AppError("Kategori tidak ditemukan atau kamu tidak memiliki akses", 404));
  }
  res.status(200).json({ success: true, message: "Kategori berhasil dihapus" });
});