import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createListing } from '../../services/firebaseServices';
import Toast from '../Common/Toast';
import './Listing.css';

function CreateListing() {
    const { userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'lodging',
        subCategory: '',
        price: '',
        location: '',
        images: [],
        amenities: [],
        capacity: '',
        available: true
    });

    const categories = {
        lodging: ['Lodge', 'Camp', 'Homestay', 'Eco-lodge'],
        guide: ['Nature Guide', 'Cultural Guide', 'Adventure Guide', 'Bird Watching'],
        food: ['Restaurant', 'Catering', 'Local Cuisine', 'Farm-to-table'],
        craft: ['Artisan', 'Handicrafts', 'Textiles', 'Pottery', 'Beadwork']
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.description || !formData.price || !formData.location) {
            setToast({ message: 'Please fill in all required fields', type: 'error' });
            return;
        }

        if (!userData) {
            setToast({ message: 'Please login to create a listing', type: 'error' });
            return;
        }

        setLoading(true);
        const result = await createListing({
            ...formData,
            providerId: userData.uid,
            providerName: userData.name,
            price: parseFloat(formData.price),
            capacity: formData.capacity ? parseInt(formData.capacity) : null,
            amenities: formData.amenities.filter(a => a.trim() !== '')
        });

        if (result.success) {
            setToast({ message: 'Listing created successfully!', type: 'success' });
            setFormData({
                title: '',
                description: '',
                category: 'lodging',
                subCategory: '',
                price: '',
                location: '',
                images: [],
                amenities: [],
                capacity: '',
                available: true
            });
        } else {
            setToast({ message: result.error || 'Failed to create listing', type: 'error' });
        }
        setLoading(false);
    };

    return (
        <div className="create-listing">
            <h2>Create New Listing</h2>
            <p style={{ color: '#5a7a6a', marginBottom: '20px' }}>
                List your lodge, guide service, food experience, or crafts
            </p>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Category *</label>
                    <select name="category" value={formData.category} onChange={handleChange} required>
                        <option value="lodging">🏡 Lodging</option>
                        <option value="guide">🧭 Guide</option>
                        <option value="food">🍽️ Food</option>
                        <option value="craft">🎨 Craft</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Sub-Category *</label>
                    <select name="subCategory" value={formData.subCategory} onChange={handleChange} required>
                        <option value="">Select sub-category</option>
                        {categories[formData.category]?.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Title *</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Serene Mountain Lodge"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Description *</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe your offering in detail..."
                        rows="4"
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Price (ZAR) *</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Capacity</label>
                        <input
                            type="number"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            placeholder="Number of people"
                            min="1"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Location *</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., Kruger National Park"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Amenities (comma separated)</label>
                    <input
                        type="text"
                        name="amenities"
                        value={formData.amenities.join(', ')}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            amenities: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        }))}
                        placeholder="WiFi, Parking, Pool, etc."
                    />
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            name="available"
                            checked={formData.available}
                            onChange={handleChange}
                        />
                        Available for booking
                    </label>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Listing'}
                </button>
            </form>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

export default CreateListing;