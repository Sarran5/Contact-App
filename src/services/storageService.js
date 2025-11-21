// Simple Storage Service with Only LocalStorage
class StorageService {
  constructor() {
    this.backend = 'localStorage';
  }

  // Save contacts to localStorage
  async saveContacts(contacts) {
    try {
      localStorage.setItem('saveLifeContacts', JSON.stringify(contacts));
      return true;
    } catch (error) {
      console.error('Save error:', error);
      throw new Error('Storage is full. Please delete some contacts.');
    }
  }

  // Load contacts from localStorage
  async loadContacts() {
    try {
      const saved = localStorage.getItem('saveLifeContacts');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Load error:', error);
      return [];
    }
  }

  // Clear all contacts
  async clearContacts() {
    try {
      localStorage.removeItem('saveLifeContacts');
      return true;
    } catch (error) {
      console.error('Clear error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();