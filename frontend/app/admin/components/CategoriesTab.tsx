'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react'
import { Toast } from '@/components/Toast'

interface Category {
  id: number
  name: string
  slug: string
  description: string
  image: string
  created_at: string
}

export default function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: ''
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/categories')
      const data = await response.json()
      setCategories(Array.isArray(data) ? data : [])
      
      // Minimum 3 sekund ko'rsatish
      await new Promise(resolve => setTimeout(resolve, 3000))
    } catch (error) {
      console.error('Error loading categories:', error)
      setToast({ message: 'Kategoriyalarni yuklashda xatolik', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    const uploadFormData = new FormData()
    uploadFormData.append('file', file)

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: uploadFormData
      })
      
      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, image: data.url }))
        setToast({ message: 'Rasm yuklandi', type: 'success' })
      } else {
        setToast({ message: 'Rasm yuklashda xatolik', type: 'error' })
      }
    } catch (error) {
      setToast({ message: 'Rasm yuklashda xatolik', type: 'error' })
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (categories.length >= 4) {
      setToast({ message: '4 ta kategoriyadan ko\'proq qo\'sha olmaysiz', type: 'error' })
      return
    }

    if (!formData.name || !formData.slug || !formData.description) {
      setToast({ message: 'Barcha maydonlarni to\'ldiring', type: 'error' })
      return
    }

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        setToast({ message: 'Kategoriya qo\'shildi!', type: 'success' })
        setShowAddModal(false)
        resetForm()
        await loadCategories()
      } else {
        setToast({ message: data.error || 'Xatolik yuz berdi', type: 'error' })
      }
    } catch (error) {
      console.error('Add error:', error)
      setToast({ message: 'Xatolik yuz berdi', type: 'error' })
    }
  }

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.slug || !formData.description) {
      setToast({ message: 'Barcha maydonlarni to\'ldiring', type: 'error' })
      return
    }

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`http://localhost:5000/api/categories/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        setToast({ message: 'Kategoriya tahrirlandi!', type: 'success' })
        setShowEditModal(false)
        setEditingId(null)
        resetForm()
        await loadCategories()
      } else {
        setToast({ message: data.error || 'Xatolik yuz berdi', type: 'error' })
      }
    } catch (error) {
      console.error('Edit error:', error)
      setToast({ message: 'Xatolik yuz berdi', type: 'error' })
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (categories.length <= 1) {
      setToast({ message: 'Kamida 1 ta kategoriya bo\'lishi kerak', type: 'error' })
      return
    }

    if (!confirm('Kategoriyani o\'chirishni tasdiqlaysizmi?')) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setToast({ message: 'Kategoriya o\'chirildi!', type: 'success' })
        await loadCategories()
      } else {
        setToast({ message: data.error || 'Xatolik yuz berdi', type: 'error' })
      }
    } catch (error) {
      console.error('Delete error:', error)
      setToast({ message: 'Xatolik yuz berdi', type: 'error' })
    }
  }

  const openEditModal = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image
    })
    setImagePreview(category.image)
    setEditingId(category.id)
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', image: '' })
    setImagePreview(null)
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Kategoriyalar</h2>
          <p className="text-gray-400 text-sm mt-1">
            Jami: <span className="text-white font-semibold">{categories.length}/4</span>
            {categories.length >= 4 ? ' (Maksimal)' : ` (${4 - categories.length} ta qo'sha olasiz)`}
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowAddModal(true)
          }}
          disabled={categories.length >= 4}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Yangi Kategoriya
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-[#0a0e1a] border border-white/10 rounded-xl overflow-hidden animate-pulse"
            >
              <div className="h-40 bg-gray-700/30"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-700/30 rounded mb-2"></div>
                <div className="h-4 bg-gray-700/30 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-gray-700/30 rounded mb-4 w-1/2"></div>
                <div className="flex gap-2">
                  <div className="flex-1 h-10 bg-gray-700/30 rounded-lg"></div>
                  <div className="flex-1 h-10 bg-gray-700/30 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-[#0a0e1a] border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-gray-400 mb-4">Kategoriyalar yo'q</p>
          <button
            onClick={() => {
              resetForm()
              setShowAddModal(true)
            }}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
          >
            Birinchi Kategoriyani Qo'shish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-[#0a0e1a] border border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition-all group"
            >
              {category.image && (
                <div className="relative h-40 overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-2">{category.name}</h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{category.description}</p>
                <p className="text-xs text-gray-500 mb-4">Slug: {category.slug}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(category)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 py-2 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                    Tahrirlash
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={categories.length <= 1}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    O'chirish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0a0e1a] border border-white/20 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Yangi Kategoriya</h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  resetForm()
                }}
                className="p-1 hover:bg-white/10 rounded-lg"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Rasm</label>
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null)
                          setFormData(prev => ({ ...prev, image: '' }))
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full h-40 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-white/40 transition-all bg-white/5">
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Rasm yuklash uchun bosing</p>
                      </div>
                      <input
                        type="file"
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Nomi</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Kategoriya nomi"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="byudjetillar, komfortli, premiumlar, krossoverlar"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Tavsif</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Kategoriya tavsifi"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0a0e1a] border border-white/20 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Kategoriyani Tahrirlash</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  resetForm()
                }}
                className="p-1 hover:bg-white/10 rounded-lg"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <form onSubmit={handleEditCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Rasm</label>
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null)
                          setFormData(prev => ({ ...prev, image: '' }))
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full h-40 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-white/40 transition-all bg-white/5">
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Rasm yuklash uchun bosing</p>
                      </div>
                      <input
                        type="file"
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Nomi</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Tavsif</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    resetForm()
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
