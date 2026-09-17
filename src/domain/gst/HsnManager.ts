/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * Intellectual Property of GemSphere Technologies.
 */

export interface HsnItem {
  code: string; // 4, 6, or 8 digit HSN/SAC code
  description: string;
  defaultTaxRate: number; // e.g. 5, 12, 18, 28
  type: 'GOODS' | 'SERVICES';
}

export class HsnManager {
  private static HSN_CATALOG: HsnItem[] = [
    { code: '9983', description: 'IT & Software Development Services', defaultTaxRate: 18, type: 'SERVICES' },
    { code: '9984', description: 'Telecommunications, Broadcasting & Information Supply Services', defaultTaxRate: 18, type: 'SERVICES' },
    { code: '9963', description: 'Accommodation, Food & Beverage Services', defaultTaxRate: 5, type: 'SERVICES' },
    { code: '9954', description: 'Construction Services', defaultTaxRate: 12, type: 'SERVICES' },
    { code: '8471', description: 'Automatic Data Processing Machines & Computers', defaultTaxRate: 18, type: 'GOODS' },
    { code: '8517', description: 'Smartphones & Telephony Apparatus', defaultTaxRate: 18, type: 'GOODS' },
    { code: '6109', description: 'T-Shirts, Singlets & Vests (Knitted/Crocheted)', defaultTaxRate: 5, type: 'GOODS' },
    { code: '6203', description: 'Men Suits, Trousers & Shirts', defaultTaxRate: 12, type: 'GOODS' },
    { code: '1006', description: 'Rice & Paddy Grains (Branded)', defaultTaxRate: 5, type: 'GOODS' },
    { code: '0401', description: 'Milk & Cream (Fresh, Unsweetened)', defaultTaxRate: 0, type: 'GOODS' },
    { code: '8703', description: 'Motor Cars & Vehicles', defaultTaxRate: 28, type: 'GOODS' }
  ];

  /**
   * Search HSN catalog by code or description keyword.
   */
  public static search(query: string): HsnItem[] {
    if (!query || query.trim().length === 0) {
      return this.HSN_CATALOG.slice(0, 5);
    }
    const q = query.toLowerCase().trim();
    return this.HSN_CATALOG.filter(
      (item) => item.code.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    );
  }

  /**
   * Get HSN details by code.
   */
  public static getByCode(code: string): HsnItem | null {
    if (!code) return null;
    return this.HSN_CATALOG.find((item) => item.code === code.trim()) || null;
  }
}
