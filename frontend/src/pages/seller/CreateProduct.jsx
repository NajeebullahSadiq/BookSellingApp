import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { productAPI, categoryAPI } from '../../utils/api';

const CreateProduct = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    tags: '',
  });
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewPages, setPreviewPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await categoryAPI.getAll();
      setCategories(data.data);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImageChange = (e) => {
    setPreviewImage(e.target.files[0]);
  };

  const handlePreviewPagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error('You can upload a maximum of 5 preview pages');
      return;
    }
    setPreviewPages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please upload a file');
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('subcategory', formData.subcategory);
    data.append('tags', formData.tags);
    data.append('file', file);
    if (previewImage) {
      data.append('previewImage', previewImage);
    }
    if (previewPages.length > 0) {
      previewPages.forEach((page) => {
        data.append('previewPages', page);
      });
    }

    try {
      await productAPI.create(data);
      toast.success('Product created! Waiting for admin approval.');
      navigate('/seller/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Product</h1>

      <form onSubmit={handleSubmit} className="card">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Data Structures Notes - Complete Guide"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              rows="4"
              placeholder="Describe your product in detail..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price ($) *</label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="input-field"
                placeholder="9.99"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subcategory (Optional)</label>
            <input
              type="text"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Computer Science, Mathematics"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., notes, assignment, study guide"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Product File * (PDF, DOC, etc.)</label>
            <input
              type="file"
              required
              onChange={handleFileChange}
              className="input-field"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar"
            />
            <p className="text-sm text-gray-500 mt-1">Max size: 50MB</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Preview Image (Optional)</label>
            <input
              type="file"
              onChange={handleImageChange}
              className="input-field"
              accept="image/*"
            />
            <p className="text-sm text-gray-500 mt-1">Max size: 5MB</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Preview Pages (Optional)</label>
            <input
              type="file"
              multiple
              onChange={handlePreviewPagesChange}
              className="input-field"
              accept="image/*"
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload up to 5 sample pages for customers to preview before purchase. Max size: 5MB each
            </p>
            {previewPages.length > 0 && (
              <p className="text-sm text-green-600 mt-1">
                {previewPages.length} file(s) selected
              </p>
            )}
          </div>

          <div className="border-t pt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Creating Product...' : 'Create Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;
