/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
import { DatabaseService } from '../../core/storage/sqlite';
import { Contact, ContactType } from '../../domain/entities/contact';

export const ContactRepository = {
  save: async (contact: Contact): Promise<void> => {
    await DatabaseService.execute(
      `INSERT OR REPLACE INTO contacts (id, type, name, email, phone, address, tax_id, opening_balance, current_balance, currency)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        contact.id,
        contact.type,
        contact.name,
        contact.email,
        contact.phone,
        contact.address,
        contact.gstin || null,
        contact.openingBalance || 0,
        contact.currentBalance,
        contact.tenantId,
      ]
    );
  },

  getAllByType: async (type: ContactType): Promise<Contact[]> => {
    const rows = await DatabaseService.getAll<any>('SELECT * FROM contacts WHERE type = ?', [type]);
    return rows.map((row) => ({
      id: row.id,
      tenantId: row.currency, // Mapping currency column to tenantId for now
      type: row.type as ContactType,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      gstin: row.tax_id,
      openingBalance: row.opening_balance,
      currentBalance: row.current_balance,
    }));
  },

  updateBalance: async (id: string, amount: number) => {
    await DatabaseService.execute(
      'UPDATE contacts SET current_balance = current_balance + ? WHERE id = ?',
      [amount, id]
    );
  },

  // Aliases for compatibility
  createContact: async (contact: Contact): Promise<void> => {
    return ContactRepository.save(contact);
  },

  getAllContacts: async (): Promise<Contact[]> => {
    const rows = await DatabaseService.getAll<any>('SELECT * FROM contacts');
    return rows.map((row) => ({
      id: row.id,
      tenantId: row.currency,
      type: row.type as ContactType,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      gstin: row.tax_id,
      openingBalance: row.opening_balance,
      currentBalance: row.current_balance,
    }));
  },

  delete: async (id: string): Promise<void> => {
    await DatabaseService.execute('DELETE FROM contacts WHERE id = ?', [id]);
  },

  getById: async (id: string): Promise<Contact | null> => {
    const row = await DatabaseService.getFirst<any>('SELECT * FROM contacts WHERE id = ?', [id]);
    if (!row) return null;
    return {
      id: row.id,
      tenantId: row.currency,
      type: row.type as ContactType,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      gstin: row.tax_id,
      openingBalance: row.opening_balance,
      currentBalance: row.current_balance,
    };
  },
};
