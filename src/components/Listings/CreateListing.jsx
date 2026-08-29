import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createListing } from '../../services/firebaseServices';
import Toast from '../Common/Toast';
import './Listing.css';

function CreateListing({ onListingCreated }) {
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
        imageFile: null,
        imagePreview: null,
        amenities: [],
        capacity: '',
        available: true,
        roomTypes: [{ name: 'Standard', price: '', capacity: '' }],
        menuItems: [{ name: '', price: '', description: '' }],
        tourTypes: [{ name: '', price: '', duration: '', maxPeople: '' }],
        craftItems: [{ name: '', price: '', description: '' }]
    });

    const categories = {
        lodging: ['Lodge', 'Camp', 'Homestay', 'Eco-lodge', 'Guest House'],
        guide: ['Nature Guide', 'Cultural Guide', 'Adventure Guide', 'Bird Watching', 'Game Drive', 'Walking Safari'],
        food: ['Restaurant', 'Catering', 'Local Cuisine', 'Farm-to-table', 'Cooking Class', 'Food Tasting'],
        craft: ['Artisan', 'Handicrafts', 'Textiles', 'Pottery', 'Beadwork', 'Woodwork', 'Workshop']
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                setToast({ message: 'Please upload a JPG, PNG, or GIF image', type: 'error' });
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                setToast({ message: 'Image must be less than 5MB', type: 'error' });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    imageFile: file,
                    imagePreview: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Room types for lodging
    const addRoomType = () => {
        setFormData(prev => ({
            ...prev,
            roomTypes: [...prev.roomTypes, { name: '', price: '', capacity: '' }]
        }));
    };

    const removeRoomType = (index) => {
        setFormData(prev => ({
            ...prev,
            roomTypes: prev.roomTypes.filter((_, i) => i !== index)
        }));
    };

    const updateRoomType = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            roomTypes: prev.roomTypes.map((room, i) => 
                i === index ? { ...room, [field]: value } : room
            )
        }));
    };

    // Menu items for food
    const addMenuItem = () => {
        setFormData(prev => ({
            ...prev,
            menuItems: [...prev.menuItems, { name: '', price: '', description: '' }]
        }));
    };

    const removeMenuItem = (index) => {
        setFormData(prev => ({
            ...prev,
            menuItems: prev.menuItems.filter((_, i) => i !== index)
        }));
    };

    const updateMenuItem = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            menuItems: prev.menuItems.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    // Tour types for guides
    const addTourType = () => {
        setFormData(prev => ({
            ...prev,
            tourTypes: [...prev.tourTypes, { name: '', price: '', duration: '', maxPeople: '' }]
        }));
    };

    const removeTourType = (index) => {
        setFormData(prev => ({
            ...prev,
            tourTypes: prev.tourTypes.filter((_, i) => i !== index)
        }));
    };

    const updateTourType = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            tourTypes: prev.tourTypes.map((tour, i) => 
                i === index ? { ...tour, [field]: value } : tour
            )
        }));
    };

    // Craft items
    const addCraftItem = () => {
        setFormData(prev => ({
            ...prev,
            craftItems: [...prev.craftItems, { name: '', price: '', description: '' }]
        }));
    };

    const removeCraftItem = (index) => {
        setFormData(prev => ({
            ...prev,
            craftItems: prev.craftItems.filter((_, i) => i !== index)
        }));
    };

    const updateCraftItem = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            craftItems: prev.craftItems.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.description || !formData.location) {
            setToast({ message: 'Please fill in all required fields', type: 'error' });
            return;
        }

        if (!userData) {
            setToast({ message: 'Please login to create a listing', type: 'error' });
            return;
        }

        // Validate pricing based on category
        if (formData.category === 'lodging') {
            const hasValidRoom = formData.roomTypes.some(r => r.name && r.price);
            if (!hasValidRoom) {
                setToast({ message: 'Please add at least one room type with name and price', type: 'error' });
                return;
            }
        } else if (formData.category === 'food') {
            const hasValidItem = formData.menuItems.some(m => m.name && m.price);
            if (!hasValidItem) {
                setToast({ message: 'Please add at least one menu item with name and price', type: 'error' });
                return;
            }
        } else if (formData.category === 'guide') {
            const hasValidTour = formData.tourTypes.some(t => t.name && t.price);
            if (!hasValidTour) {
                setToast({ message: 'Please add at least one tour type with name and price', type: 'error' });
                return;
            }
        } else if (formData.category === 'craft') {
            const hasValidItem = formData.craftItems.some(c => c.name && c.price);
            if (!hasValidItem) {
                setToast({ message: 'Please add at least one craft item with name and price', type: 'error' });
                return;
            }
        }

        setLoading(true);
        
        try {
            let imageUrl = null;
            if (formData.imagePreview) {
                imageUrl = formData.imagePreview;
            } else {
                const placeholderImages = {
                    lodging: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
                    guide: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=400&h=300&fit=crop',
                    food: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop',
                    craft: 'https://images.unsplash.com/photo-1565608434237-ff63d6f4a633?w=400&h=300&fit=crop'
                };
                imageUrl = placeholderImages[formData.category] || placeholderImages.lodging;
            }

            // Prepare data based on category
            let pricingData = {};
            
            if (formData.category === 'lodging') {
                pricingData = {
                    durationType: 'night',
                    roomTypes: formData.roomTypes.filter(r => r.name && r.price)
                };
            } else if (formData.category === 'food') {
                pricingData = {
                    durationType: 'menu',
                    menuItems: formData.menuItems.filter(m => m.name && m.price)
                };
            } else if (formData.category === 'guide') {
                pricingData = {
                    durationType: 'tour',
                    tourTypes: formData.tourTypes.filter(t => t.name && t.price)
                };
            } else if (formData.category === 'craft') {
                pricingData = {
                    durationType: 'item',
                    craftItems: formData.craftItems.filter(c => c.name && c.price)
                };
            }

            const result = await createListing({
                ...formData,
                providerId: userData.uid,
                providerName: userData.name,
                capacity: formData.capacity ? parseInt(formData.capacity) : null,
                amenities: formData.amenities.filter(a => a.trim() !== ''),
                imageUrl: imageUrl,
                imageFile: formData.imageFile ? formData.imageFile.name : null,
                ...pricingData,
                price: formData.price
            });

            if (result.success) {
                setToast({ message: '✅ Listing created successfully!', type: 'success' });
                // Reset form
                setFormData({
                    title: '',
                    description: '',
                    category: 'lodging',
                    subCategory: '',
                    price: '',
                    location: '',
                    imageFile: null,
                    imagePreview: null,
                    amenities: [],
                    capacity: '',
                    available: true,
                    roomTypes: [{ name: 'Standard', price: '', capacity: '' }],
                    menuItems: [{ name: '', price: '', description: '' }],
                    tourTypes: [{ name: '', price: '', duration: '', maxPeople: '' }],
                    craftItems: [{ name: '', price: '', description: '' }]
                });
                document.getElementById('image-upload').value = '';
                
                // Call the callback to switch to listings view
                if (onListingCreated) {
                    onListingCreated();
                }
            } else {
                setToast({ message: result.error || 'Failed to create listing', type: 'error' });
            }
        } catch (error) {
            console.error('Error creating listing:', error);
            setToast({ message: 'An error occurred. Please try again.', type: 'error' });
        }
        setLoading(false);
    };

    const renderPricingSection = () => {
        switch (formData.category) {
            case 'lodging':
                return (
                    <div className="pricing-section">
                        <h4>🏠 Room Types & Pricing</h4>
                        <p style={{ color: '#5a7a6a', fontSize: '14px', marginBottom: '16px' }}>
                            Add different room types with their prices per night
                        </p>
                        {formData.roomTypes.map((room, index) => (
                            <div key={index} className="pricing-item">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Room Type</label>
                                        <input
                                            type="text"
                                            value={room.name}
                                            onChange={(e) => updateRoomType(index, 'name', e.target.value)}
                                            placeholder="e.g., Standard, Deluxe, Suite"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Price (ZAR/night)</label>
                                        <input
                                            type="number"
                                            value={room.price}
                                            onChange={(e) => updateRoomType(index, 'price', e.target.value)}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Capacity</label>
                                    <input
                                        type="number"
                                        value={room.capacity}
                                        onChange={(e) => updateRoomType(index, 'capacity', e.target.value)}
                                        placeholder="Number of people"
                                        min="1"
                                    />
                                </div>
                                {formData.roomTypes.length > 1 && (
                                    <button 
                                        type="button" 
                                        className="remove-btn"
                                        onClick={() => removeRoomType(index)}
                                    >
                                        Remove Room Type
                                    </button>
                                )}
                                <hr style={{ margin: '12px 0' }} />
                            </div>
                        ))}
                        <button type="button" className="add-btn" onClick={addRoomType}>
                            + Add Room Type
                        </button>
                    </div>
                );

            case 'food':
                return (
                    <div className="pricing-section">
                        <h4>🍽️ Menu Items & Pricing</h4>
                        <p style={{ color: '#5a7a6a', fontSize: '14px', marginBottom: '16px' }}>
                            Add your menu items with prices
                        </p>
                        {formData.menuItems.map((item, index) => (
                            <div key={index} className="pricing-item">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Item Name</label>
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                                            placeholder="e.g., Chakalaka, Pap & Vleis"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Price (ZAR)</label>
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => updateMenuItem(index, 'price', e.target.value)}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => updateMenuItem(index, 'description', e.target.value)}
                                        placeholder="Brief description of the item"
                                    />
                                </div>
                                {formData.menuItems.length > 1 && (
                                    <button 
                                        type="button" 
                                        className="remove-btn"
                                        onClick={() => removeMenuItem(index)}
                                    >
                                        Remove Item
                                    </button>
                                )}
                                <hr style={{ margin: '12px 0' }} />
                            </div>
                        ))}
                        <button type="button" className="add-btn" onClick={addMenuItem}>
                            + Add Menu Item
                        </button>
                    </div>
                );

            case 'guide':
                return (
                    <div className="pricing-section">
                        <h4>🧭 Tour Types & Pricing</h4>
                        <p style={{ color: '#5a7a6a', fontSize: '14px', marginBottom: '16px' }}>
                            Add different tour types with their prices
                        </p>
                        {formData.tourTypes.map((tour, index) => (
                            <div key={index} className="pricing-item">
                                <div className="form-group">
                                    <label>Tour Name</label>
                                    <input
                                        type="text"
                                        value={tour.name}
                                        onChange={(e) => updateTourType(index, 'name', e.target.value)}
                                        placeholder="e.g., Morning Safari, Sunset Walk"
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Price (ZAR)</label>
                                        <input
                                            type="number"
                                            value={tour.price}
                                            onChange={(e) => updateTourType(index, 'price', e.target.value)}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Duration (hours)</label>
                                        <input
                                            type="number"
                                            value={tour.duration}
                                            onChange={(e) => updateTourType(index, 'duration', e.target.value)}
                                            placeholder="2"
                                            min="0.5"
                                            step="0.5"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Max People</label>
                                    <input
                                        type="number"
                                        value={tour.maxPeople}
                                        onChange={(e) => updateTourType(index, 'maxPeople', e.target.value)}
                                        placeholder="10"
                                        min="1"
                                    />
                                </div>
                                {formData.tourTypes.length > 1 && (
                                    <button 
                                        type="button" 
                                        className="remove-btn"
                                        onClick={() => removeTourType(index)}
                                    >
                                        Remove Tour
                                    </button>
                                )}
                                <hr style={{ margin: '12px 0' }} />
                            </div>
                        ))}
                        <button type="button" className="add-btn" onClick={addTourType}>
                            + Add Tour Type
                        </button>
                    </div>
                );

            case 'craft':
                return (
                    <div className="pricing-section">
                        <h4>🎨 Craft Items & Pricing</h4>
                        <p style={{ color: '#5a7a6a', fontSize: '14px', marginBottom: '16px' }}>
                            Add your craft items with prices
                        </p>
                        {formData.craftItems.map((item, index) => (
                            <div key={index} className="pricing-item">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Item Name</label>
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => updateCraftItem(index, 'name', e.target.value)}
                                            placeholder="e.g., Beaded Necklace, Wooden Sculpture"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Price (ZAR)</label>
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => updateCraftItem(index, 'price', e.target.value)}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => updateCraftItem(index, 'description', e.target.value)}
                                        placeholder="Brief description of the item"
                                    />
                                </div>
                                {formData.craftItems.length > 1 && (
                                    <button 
                                        type="button" 
                                        className="remove-btn"
                                        onClick={() => removeCraftItem(index)}
                                    >
                                        Remove Item
                                    </button>
                                )}
                                <hr style={{ margin: '12px 0' }} />
                            </div>
                        ))}
                        <button type="button" className="add-btn" onClick={addCraftItem}>
                            + Add Craft Item
                        </button>
                    </div>
                );

            default:
                return null;
        }
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
                        <option value="food">🍽️ Food / Restaurant</option>
                        <option value="guide">🧭 Guide / Tours</option>
                        <option value="craft">🎨 Crafts / Artisans</option>
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

                {renderPricingSection()}

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
                    <label>Upload Image (JPG, PNG, or GIF)</label>
                    <input
                        type="file"
                        id="image-upload"
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        onChange={handleImageChange}
                    />
                    <small style={{ color: '#95a5a6', display: 'block', marginTop: '4px' }}>
                        Max size: 5MB. Supported formats: JPG, PNG, GIF
                    </small>
                    {formData.imagePreview && (
                        <div className="image-preview">
                            <img src={formData.imagePreview} alt="Preview" />
                            <button 
                                type="button" 
                                className="remove-image"
                                onClick={() => {
                                    setFormData(prev => ({
                                        ...prev,
                                        imageFile: null,
                                        imagePreview: null
                                    }));
                                    document.getElementById('image-upload').value = '';
                                }}
                            >
                                × Remove
                            </button>
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>Amenities (comma separated)</label>
                    <input
                        type="text"
                        value={formData.amenities.join(', ')}
                        onChange={(e) => {
                            const value = e.target.value;
                            const amenitiesArray = value.split(',').map(item => item.trim()).filter(item => item !== '');
                            setFormData(prev => ({
                                ...prev,
                                amenities: amenitiesArray
                            }));
                        }}
                        placeholder="WiFi, Parking, Pool, Restaurant"
                    />
                    <small style={{ color: '#95a5a6', display: 'block', marginTop: '4px' }}>
                        Separate each amenity with a comma (e.g., "WiFi, Parking, Pool")
                    </small>
                    {formData.amenities.length > 0 && (
                        <div style={{ 
                            marginTop: '8px', 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: '6px' 
                        }}>
                            {formData.amenities.map((amenity, index) => (
                                <span 
                                    key={index}
                                    style={{
                                        background: 'var(--light)',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '13px',
                                        color: 'var(--primary-dark)'
                                    }}
                                >
                                    {amenity}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newAmenities = formData.amenities.filter((_, i) => i !== index);
                                            setFormData(prev => ({
                                                ...prev,
                                                amenities: newAmenities
                                            }));
                                        }}
                                        style={{
                                            marginLeft: '6px',
                                            background: 'none',
                                            border: 'none',
                                            color: '#e74c3c',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
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