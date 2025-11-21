import React, { useState, useEffect } from 'react';
import { createWorker } from 'tesseract.js';

const ContactForm = ({ onAddContact, onUpdateContact, editingContact, cancelEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');

  // Reset form when editingContact changes
  useEffect(() => {
    if (editingContact) {
      setFormData({
        name: editingContact.name,
        phone: editingContact.phone,
        email: editingContact.email || ''
      });
      setSelectedImages(editingContact.imageUrls || []);
    } else {
      resetForm();
    }
  }, [editingContact]);

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: ''
    });
    setSelectedImages([]);
    setExtractedText('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Process Multiple Images with OCR
  const processImagesWithOCR = async (imageFiles) => {
    setIsLoading(true);
    setProgress(0);
    let allExtractedText = '';
    
    try {
      const worker = await createWorker('eng');
      const totalImages = imageFiles.length;

      for (let i = 0; i < totalImages; i++) {
        const file = imageFiles[i];
        
        worker.onProgress = (p) => {
          const imageProgress = (i / totalImages) * 100;
          const currentImageProgress = (p.progress * 100) / totalImages;
          setProgress(Math.round(imageProgress + currentImageProgress));
        };

        const { data: { text } } = await worker.recognize(file);
        allExtractedText += `\n--- Image ${i + 1} ---\n${text}\n`;
      }

      await worker.terminate();
      setExtractedText(allExtractedText);
      parseExtractedData(allExtractedText);
      
    } catch (error) {
      console.error('OCR Error:', error);
      alert('OCR processing failed. Please try other images or enter manually.');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  // Parse extracted text from multiple images
  const parseExtractedData = (text) => {
    console.log("All Extracted Text:", text);
    
    // Combine text from all images for parsing
    const combinedText = text.replace(/--- Image \d+ ---/g, '');
    
    // Email extraction
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const foundEmails = combinedText.match(emailRegex);
    if (foundEmails && foundEmails.length > 0) {
      setFormData(prev => ({ ...prev, email: foundEmails[0] }));
    }

    // Phone extraction
    const phoneRegex = /[\+]?[1-9]?[-\s\.]?[(]?[\d]{3}[)]?[-\s\.]?[\d]{3}[-\s\.]?[\d]{4,6}/g;
    const foundPhones = combinedText.match(phoneRegex);
    if (foundPhones && foundPhones.length > 0) {
      const cleanPhone = foundPhones[0].replace(/[-\s\(\)]/g, '');
      setFormData(prev => ({ ...prev, phone: cleanPhone }));
    }

    // Name extraction - try to find the most likely name
    const lines = combinedText.split('\n').filter(line => 
      line.trim().length > 2 && 
      !line.match(phoneRegex) && 
      !line.match(emailRegex)
    );
    
    if (lines.length > 0) {
      // Take the first meaningful line as name
      const potentialName = lines[0].trim();
      if (potentialName.length > 2) {
        setFormData(prev => ({ ...prev, name: potentialName }));
      }
    }
  };

  // Handle Multiple File Selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Validate file types
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      alert('Please select only image files (JPG, PNG, WebP)');
      return;
    }

    // Limit to 5 images
    if (files.length > 5) {
      alert('Maximum 5 images allowed. Please select fewer images.');
      return;
    }

    // Create URLs for preview
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setSelectedImages(imageUrls);

    // Process all images with OCR
    processImagesWithOCR(files);
  };

  // Remove individual image
  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Name and Phone are required fields!');
      return;
    }

    const contactData = {
      id: editingContact ? editingContact.id : Date.now(),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      imageUrls: selectedImages, // Now storing multiple images
      createdAt: editingContact ? editingContact.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingContact) {
      onUpdateContact(contactData);
    } else {
      onAddContact(contactData);
    }

    resetForm();
  };

  return (
    <div className="contact-form">
      <h2 className="form-title">
        {editingContact ? '✏️ Edit Contact' : '📸 Add Contact from Business Cards'}
      </h2>
      
      {/* MULTIPLE IMAGE UPLOAD WITH OCR */}
      <div className="upload-section">
        <label className="upload-label">
          Upload Business Card Images (Multiple):
        </label>
        <input 
          type="file" 
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={isLoading}
          className="file-input"
        />
        <small style={{ color: '#6c757d', display: 'block', marginTop: '0.5rem' }}>
          Select multiple images (max 5). Supported: JPG, PNG, WebP
        </small>
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="loading-indicator">
            <p>🔍 Processing {selectedImages.length} image(s)... {progress}%</p>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <small>Extracting text from multiple images...</small>
          </div>
        )}
      </div>

      {/* Multiple Image Previews */}
      {selectedImages.length > 0 && (
        <div className="images-preview">
          <p><strong>Selected Images ({selectedImages.length}):</strong></p>
          <div className="preview-grid">
            {selectedImages.map((imageUrl, index) => (
              <div key={index} className="preview-item">
                <img 
                  src={imageUrl} 
                  alt={`Business card ${index + 1}`} 
                  className="preview-image"
                />
                <button 
                  type="button"
                  onClick={() => removeImage(index)}
                  className="remove-image-btn"
                  title="Remove image"
                >
                  ❌
                </button>
                <span className="image-number">#{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Text Preview */}
      {extractedText && (
        <div className="extracted-text">
          <strong>📋 Extracted Text from All Images:</strong>
          <div>{extractedText}</div>
        </div>
      )}

      {/* CONTACT FORM */}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
        </div>
        
        <div className="button-group">
          {editingContact ? (
            <>
              <button type="submit" className="btn btn-success">
                ✅ Update Contact
              </button>
              <button 
                type="button" 
                onClick={cancelEdit}
                className="btn btn-secondary"
              >
                ❌ Cancel
              </button>
            </>
          ) : (
            <>
              <button 
                type="submit" 
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? '⏳ Processing...' : '💾 Save Contact'}
              </button>
              <button 
                type="button"
                onClick={resetForm}
                className="btn btn-secondary"
              >
                🗑️ Clear Form
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default ContactForm;