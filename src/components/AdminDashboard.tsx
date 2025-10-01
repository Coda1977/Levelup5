'use client';

import { useState } from 'react';
import { TipTapEditor } from './TipTapEditor';

type Category = { id: string; title: string; display_order: number };
type Chapter = {
  id: string;
  category_id: string;
  title: string;
  content: string;
  is_published: boolean;
  display_order: number;
};

type AdminDashboardProps = {
  initialCategories: Category[];
  initialChapters: Chapter[];
};

export default function AdminDashboard({
  initialCategories,
  initialChapters,
}: AdminDashboardProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [activeTab, setActiveTab] = useState<'categories' | 'chapters'>('chapters');

  // Category form state
  const [categoryForm, setCategoryForm] = useState({ title: '', display_order: 0 });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // Chapter form state
  const [chapterForm, setChapterForm] = useState({
    title: '',
    content: '',
    category_id: '',
    display_order: 0,
    // Root cause fix: default new chapters to published so they appear on Learn
    is_published: true,
  });
  const [editingChapter, setEditingChapter] = useState<string | null>(null);

  // Category handlers
  const handleCreateCategory = async () => {
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      });

      if (!res.ok) throw new Error('Failed to create category');

      const { data } = await res.json();
      setCategories([...categories, data]);
      setCategoryForm({ title: '', display_order: 0 });
      alert('Category created successfully!');
    } catch (error) {
      alert('Error creating category');
      console.error(error);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    try {
      const category = categories.find((c) => c.id === id);
      if (!category) return;

      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...categoryForm }),
      });

      if (!res.ok) throw new Error('Failed to update category');

      const { data } = await res.json();
      setCategories(categories.map((c) => (c.id === id ? data : c)));
      setEditingCategory(null);
      setCategoryForm({ title: '', display_order: 0 });
      alert('Category updated successfully!');
    } catch (error) {
      alert('Error updating category');
      console.error(error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete category');

      setCategories(categories.filter((c) => c.id !== id));
      alert('Category deleted successfully!');
    } catch (error) {
      alert('Error deleting category');
      console.error(error);
    }
  };

  // Chapter handlers
  const handleCreateChapter = async () => {
    if (!chapterForm.category_id) {
      alert('Please select a category');
      return;
    }

    try {
      const res = await fetch('/api/admin/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chapterForm),
      });

      if (!res.ok) throw new Error('Failed to create chapter');

      const { data } = await res.json();
      setChapters([...chapters, data]);
      // Keep default as published so content remains visible on Learn by default
      setChapterForm({
        title: '',
        content: '',
        category_id: '',
        display_order: 0,
        is_published: true,
      });
      alert('Chapter created successfully!');
    } catch (error) {
      alert('Error creating chapter');
      console.error(error);
    }
  };

  const handleUpdateChapter = async (id: string) => {
    try {
      const res = await fetch('/api/admin/chapters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...chapterForm }),
      });

      if (!res.ok) throw new Error('Failed to update chapter');

      const { data } = await res.json();
      setChapters(chapters.map((c) => (c.id === id ? data : c)));
      setEditingChapter(null);
      // Maintain published default true after update form reset
      setChapterForm({
        title: '',
        content: '',
        category_id: '',
        display_order: 0,
        is_published: true,
      });
      alert('Chapter updated successfully!');
    } catch (error) {
      alert('Error updating chapter');
      console.error(error);
    }
  };

  const handleDeleteChapter = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return;

    try {
      const res = await fetch(`/api/admin/chapters?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete chapter');

      setChapters(chapters.filter((c) => c.id !== id));
      alert('Chapter deleted successfully!');
    } catch (error) {
      alert('Error deleting chapter');
      console.error(error);
    }
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category.id);
    setCategoryForm({
      title: category.title,
      display_order: category.display_order,
    });
  };

  const startEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter.id);
    setChapterForm({
      title: chapter.title,
      content: chapter.content,
      category_id: chapter.category_id,
      display_order: chapter.display_order,
      is_published: chapter.is_published,
    });
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('chapters')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'chapters'
              ? 'border-b-2 border-accent-yellow text-text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Chapters
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'categories'
              ? 'border-b-2 border-accent-yellow text-text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Categories
        </button>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={categoryForm.title}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-yellow focus:border-transparent"
                  placeholder="e.g., Foundations"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Display Order</label>
                <input
                  type="number"
                  value={categoryForm.display_order}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      display_order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-yellow focus:border-transparent"
                />
              </div>
              <div className="flex gap-4">
                {editingCategory ? (
                  <>
                    <button
                      onClick={() => handleUpdateCategory(editingCategory)}
                      className="btn-primary"
                    >
                      Update Category
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryForm({ title: '', display_order: 0 });
                      }}
                      className="px-6 py-3 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={handleCreateCategory} className="btn-primary">
                    Create Category
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Existing Categories</h2>
            <div className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{category.title}</h3>
                    <p className="text-sm text-text-secondary">
                      Order: {category.display_order}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditCategory(category)}
                      className="px-4 py-2 text-sm bg-accent-yellow rounded-lg hover:bg-opacity-90"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chapters Tab */}
      {activeTab === 'chapters' && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">
              {editingChapter ? 'Edit Chapter' : 'Create New Chapter'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={chapterForm.title}
                  onChange={(e) =>
                    setChapterForm({ ...chapterForm, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-yellow focus:border-transparent"
                  placeholder="e.g., What Is Good Management?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={chapterForm.category_id}
                  onChange={(e) =>
                    setChapterForm({ ...chapterForm, category_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-yellow focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <TipTapEditor
                  content={chapterForm.content}
                  onChange={(content) => setChapterForm({ ...chapterForm, content })}
                  placeholder="Start writing your chapter content..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Display Order</label>
                  <input
                    type="number"
                    value={chapterForm.display_order}
                    onChange={(e) =>
                      setChapterForm({
                        ...chapterForm,
                        display_order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-yellow focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chapterForm.is_published}
                      onChange={(e) =>
                        setChapterForm({
                          ...chapterForm,
                          is_published: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded border-gray-300 text-accent-yellow focus:ring-accent-yellow"
                    />
                    <span className="text-sm font-medium">Published</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-4">
                {editingChapter ? (
                  <>
                    <button
                      onClick={() => handleUpdateChapter(editingChapter)}
                      className="btn-primary"
                    >
                      Update Chapter
                    </button>
                    <button
                      onClick={() => {
                        setEditingChapter(null);
                        setChapterForm({
                          title: '',
                          content: '',
                          category_id: '',
                          display_order: 0,
                          is_published: false,
                        });
                      }}
                      className="px-6 py-3 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={handleCreateChapter} className="btn-primary">
                    Create Chapter
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Existing Chapters</h2>
            <div className="space-y-4">
              {chapters.map((chapter) => {
                const category = categories.find((c) => c.id === chapter.category_id);
                return (
                  <div
                    key={chapter.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{chapter.title}</h3>
                      <p className="text-sm text-text-secondary">
                        Category: {category?.title || 'Unknown'} • Order:{' '}
                        {chapter.display_order} •{' '}
                        {chapter.is_published ? (
                          <span className="text-accent-green">Published</span>
                        ) : (
                          <span className="text-red-500">Draft</span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditChapter(chapter)}
                        className="px-4 py-2 text-sm bg-accent-yellow rounded-lg hover:bg-opacity-90"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteChapter(chapter.id)}
                        className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}