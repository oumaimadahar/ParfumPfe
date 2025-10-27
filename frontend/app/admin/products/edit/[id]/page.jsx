"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, Save, ArrowLeft } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams(); // Récupérer l'id du produit depuis la route

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    discount: 0,
    isNew: false,
    image: null,
    hoverImage: null, // 🔹 Ajouter hoverImage
  });
  const [loading, setLoading] = useState(false);

  // 🔹 Charger les données du produit existant
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axiosInstance.get(`/api/products/${id}`);
        const product = res.data.product;
        setForm({
          name: product.name || "",
          description: product.description || "",
          price: product.price || "",
          stock: product.stock || "",
          category: product.category || "",
          discount: product.discount || 0,
          isNew: product.isNew || false,
          image: null,
          hoverImage: null, // 🔹 Initialisation hoverImage
        });
      } catch (err) {
        console.error("❌ Error fetching product:", err);
        alert("Error loading product data");
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") setForm({ ...form, [name]: checked });
    else if (type === "file") setForm({ ...form, [name]: files[0] }); // 🔹 handle image & hoverImage
    else setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock || !form.category) {
      alert("⚠️ Please fill all required fields.");
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key] !== null) formData.append(key, form[key]);
    });

    try {
      setLoading(true);
      await axiosInstance.put(`/api/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Product updated successfully!");
      router.push("/admin/products");
    } catch (err) {
      console.error("❌ Error updating product:", err);
      alert(err.response?.data?.message || "Error updating product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute role="admin">
      <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-8">
        {/* Header */}
        <div className="w-full max-w-2xl flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#e3ac28] flex items-center gap-2">
            <Save size={24} />
            Edit Product
          </h1>
          <button
            onClick={() => router.push("/admin/products")}
            className="flex items-center gap-1 text-sm sm:text-base text-gray-600 hover:text-[#e3ac28] transition"
          >
            <ArrowLeft size={18} /> Back
          </button>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-6 sm:p-8 flex flex-col gap-4"
        >
          {/* Name */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#e3ac28] outline-none"
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#e3ac28] outline-none"
              placeholder="Write a short description..."
            ></textarea>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#e3ac28] outline-none"
                placeholder="Enter price"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#e3ac28] outline-none"
                placeholder="Enter stock quantity"
                required
              />
            </div>
          </div>

          {/* Category & Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#e3ac28] outline-none"
                placeholder="Enter category"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={form.discount}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#e3ac28] outline-none"
                placeholder="0"
              />
            </div>
          </div>

          {/* Toggle isNew & Upload Images */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
            <div className="flex items-center gap-3">
              <span className="text-gray-700 font-medium">Mark as New:</span>
              <button
                type="button"
                onClick={() => setForm({ ...form, isNew: !form.isNew })}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                  form.isNew ? "bg-[#e3ac28]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
                    form.isNew ? "translate-x-6" : ""
                  }`}
                ></span>
              </button>
            </div>

            {/* Upload main image */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-[#e3ac28]">
                <Upload size={18} /> <span>Upload Image</span>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
              {form.image && (
                <p className="text-sm text-gray-500 truncate max-w-[150px]">{form.image.name}</p>
              )}
            </div>

            {/* Upload hover image */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-[#e3ac28]">
                <Upload size={18} /> <span>Upload Hover Image</span>
                <input
                  type="file"
                  name="hoverImage"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
              {form.hoverImage && (
                <p className="text-sm text-gray-500 truncate max-w-[150px]">{form.hoverImage.name}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-[#e3ac28] text-white py-2 px-6 rounded-lg mt-4 font-semibold hover:bg-[#c99820] transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={18} /> {loading ? "Saving..." : "Update Product"}
          </motion.button>
        </motion.form>
      </div>
    </ProtectedRoute>
  );
}
