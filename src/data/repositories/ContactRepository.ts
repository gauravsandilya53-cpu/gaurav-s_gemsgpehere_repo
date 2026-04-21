/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
  save: async (contact: Contact): Promise<void> => {
    DatabaseService.execute(
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

  getAllByType: (type: ContactType): Contact[] => {
    const rows = DatabaseService.getAll<any>('SELECT * FROM contacts WHERE type = ?', [type]);
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

  updateBalance: (id: string, amount: number) => {
    DatabaseService.execute(
      'UPDATE contacts SET current_balance = current_balance + ? WHERE id = ?',
      [amount, id]
    );
  },
};




