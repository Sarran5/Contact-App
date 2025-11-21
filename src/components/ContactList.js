import React from 'react';

const ContactList = ({ contacts, onEditContact, onDeleteContact }) => {
  if (contacts.length === 0) {
    return (
      <div className="contact-list">
        <h2 className="section-title">👥 Contact List</h2>
        <div className="empty-state">
          <div className="icon">📇</div>
          <h3>No contacts yet</h3>
          <p>Upload business cards or add contacts to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-list">
      <h2 className="section-title">
        👥 Contact List ({contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'})
      </h2>
      
      <div className="contacts-grid">
        {contacts.map(contact => (
          <div key={contact.id} className="contact-card">
            {/* Multiple Contact Images */}
            {contact.imageUrls && contact.imageUrls.length > 0 && (
              <div className="contact-images">
                <div className="image-carousel">
                  {contact.imageUrls.slice(0, 3).map((imageUrl, index) => (
                    <img 
                      key={index}
                      src={imageUrl} 
                      alt={`Business card ${index + 1}`} 
                      className="contact-img"
                      title={`Image ${index + 1}`}
                    />
                  ))}
                  {contact.imageUrls.length > 3 && (
                    <div className="more-images">+{contact.imageUrls.length - 3}</div>
                  )}
                </div>
              </div>
            )}
            
            {/* Contact Details */}
            <div className="contact-details">
              <h3 className="contact-name">{contact.name}</h3>
              <p className="contact-info">
                <strong>📞 Phone:</strong> {contact.phone}
              </p>
              {contact.email && (
                <p className="contact-info">
                  <strong>📧 Email:</strong> {contact.email}
                </p>
              )}
              {contact.imageUrls && (
                <p className="image-count">
                  <strong>🖼️ Images:</strong> {contact.imageUrls.length}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="contact-actions">
              <button 
                onClick={() => onEditContact(contact)}
                className="action-btn edit-btn"
                title="Edit contact"
              >
                ✏️ Edit
              </button>
              <button 
                onClick={() => onDeleteContact(contact.id)}
                className="action-btn delete-btn"
                title="Delete contact"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactList;