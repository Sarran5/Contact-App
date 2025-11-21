import React, { useState, useEffect } from 'react';
import ContactForm from './components/ContactForm';
import ContactList from './components/ContactList';
import { storageService } from './services/storageService';
import './App.css';

function App() {
  const [contacts, setContacts] = useState([]);
  const [editingContact, setEditingContact] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load contacts from localStorage
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const savedContacts = await storageService.loadContacts();
      setContacts(savedContacts);
    } catch (error) {
      console.error('Failed to load contacts:', error);
      alert('Failed to load contacts from storage.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save contacts to localStorage
  const saveContacts = async (updatedContacts) => {
    try {
      await storageService.saveContacts(updatedContacts);
      setContacts(updatedContacts);
    } catch (error) {
      console.error('Failed to save contacts:', error);
      alert('Failed to save contacts. Please try again.');
    }
  };

  const handleAddContact = async (newContact) => {
    const updatedContacts = [...contacts, newContact];
    await saveContacts(updatedContacts);
  };

  const handleEditContact = (contactToEdit) => {
    setEditingContact(contactToEdit);
  };

  const handleUpdateContact = async (updatedContact) => {
    const updatedContacts = contacts.map(contact => 
      contact.id === updatedContact.id ? updatedContact : contact
    );
    await saveContacts(updatedContacts);
    setEditingContact(null);
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      const updatedContacts = contacts.filter(contact => contact.id !== contactId);
      await saveContacts(updatedContacts);
    }
  };

  const cancelEdit = () => {
    setEditingContact(null);
  };

  const clearAllContacts = async () => {
    if (window.confirm("Are you sure you want to delete ALL contacts? This cannot be undone!")) {
      await storageService.clearContacts();
      setContacts([]);
      alert('All contacts have been deleted.');
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>💼 Business Card Management</h1>
        
        {/* Storage Info */}
        <div className="storage-info">
          <span className="storage-badge">💾 LocalStorage</span>
          <span className="contacts-count">{contacts.length} contacts</span>
          
          {contacts.length > 0 && (
            <button 
              onClick={clearAllContacts}
              className="btn-clear-all"
              title="Delete all contacts"
            >
              🗑️ Clear All
            </button>
          )}
        </div>
      </header>
      
      <main className="app-main">
        {isLoading ? (
          <div className="loading-screen">
            <div className="spinner"></div>
            <p>Loading your contacts...</p>
          </div>
        ) : (
          <>
            <ContactForm 
              onAddContact={handleAddContact}
              onUpdateContact={handleUpdateContact}
              editingContact={editingContact}
              cancelEdit={cancelEdit}
            />
            
            <ContactList 
              contacts={contacts} 
              onEditContact={handleEditContact}
              onDeleteContact={handleDeleteContact}
            />
          </>
        )}
      </main>
      
      <footer className="app-footer">
        <p>Built with React.js & Tesseract.js | Data stored in browser localStorage </p>
        <p>Contacts can be created, Updated & Deleted </p>
      </footer>
    </div>
  );
}

export default App;