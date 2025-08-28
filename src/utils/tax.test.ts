import { estimateAnnualTax, annualToMonthly } from './tax';

describe('tax calculations', () => {
  describe('estimateAnnualTax', () => {
    describe('old tax regime', () => {
      it('returns 0 for income <= 0', () => {
        expect(estimateAnnualTax(0)).toBe(0);
        expect(estimateAnnualTax(-1000)).toBe(0);
      });

      it('returns 0 for income up to 2.5 lakh (basic exemption)', () => {
        expect(estimateAnnualTax(250000, 'old')).toBe(0);
        expect(estimateAnnualTax(200000, 'old')).toBe(0);
      });

      it('calculates 5% tax for 2.5L to 5L slab', () => {
        // Income of 3 lakh: (300000 - 250000) * 5% = 2500 + 4% cess
        const taxableAmount = 300000 - 250000; // 50000
        const tax = taxableAmount * 0.05; // 2500
        const cess = tax * 0.04; // 100
        const expected = Math.round(tax + cess); // 2600
        expect(estimateAnnualTax(300000, 'old')).toBe(expected);

        // Income of 5 lakh: (500000 - 250000) * 5% = 12500 + 4% cess
        const taxableAt5L = 500000 - 250000; // 250000
        const taxAt5L = taxableAt5L * 0.05; // 12500
        const cessAt5L = taxAt5L * 0.04; // 500
        const expectedAt5L = Math.round(taxAt5L + cessAt5L); // 13000
        expect(estimateAnnualTax(500000, 'old')).toBe(expectedAt5L);
      });

      it('calculates tax for 5L to 10L slab (20% rate)', () => {
        // Income of 7.5 lakh
        // First 2.5L: 0 tax
        // Next 2.5L (2.5L to 5L): 2.5L * 5% = 12500
        // Next 2.5L (5L to 7.5L): 2.5L * 20% = 50000
        // Total tax: 12500 + 50000 = 62500
        // Cess: 62500 * 4% = 2500
        // Total: 65000
        const slab1 = 250000 * 0.05; // 12500
        const slab2 = 250000 * 0.2; // 50000
        const totalTax = slab1 + slab2; // 62500
        const cess = totalTax * 0.04; // 2500
        const expected = Math.round(totalTax + cess); // 65000
        expect(estimateAnnualTax(750000, 'old')).toBe(expected);
      });

      it('calculates tax for income above 10L (30% rate)', () => {
        // Income of 15 lakh
        // First 2.5L: 0
        // Next 2.5L: 2.5L * 5% = 12500
        // Next 5L: 5L * 20% = 100000
        // Next 5L: 5L * 30% = 150000
        // Total tax: 12500 + 100000 + 150000 = 262500
        // Cess: 262500 * 4% = 10500
        // Total: 273000
        const slab1 = 250000 * 0.05; // 12500
        const slab2 = 500000 * 0.2; // 100000
        const slab3 = 500000 * 0.3; // 150000
        const totalTax = slab1 + slab2 + slab3; // 262500
        const cess = totalTax * 0.04; // 10500
        const expected = Math.round(totalTax + cess); // 273000
        expect(estimateAnnualTax(1500000, 'old')).toBe(expected);
      });
    });

    describe('new tax regime', () => {
      it('returns 0 for income up to 2.5 lakh', () => {
        expect(estimateAnnualTax(250000, 'new')).toBe(0);
        expect(estimateAnnualTax(200000, 'new')).toBe(0);
      });

      it('calculates 5% tax for 2.5L to 5L slab', () => {
        const taxableAmount = 400000 - 250000; // 150000
        const tax = taxableAmount * 0.05; // 7500
        const cess = tax * 0.04; // 300
        const expected = Math.round(tax + cess); // 7800
        expect(estimateAnnualTax(400000, 'new')).toBe(expected);
      });

      it('calculates 10% tax for 5L to 7.5L slab', () => {
        // Income of 6 lakh
        // First 2.5L: 0
        // Next 2.5L: 2.5L * 5% = 12500
        // Next 1L: 1L * 10% = 10000
        // Total: 22500 + cess
        const slab1 = 250000 * 0.05; // 12500
        const slab2 = 100000 * 0.1; // 10000
        const totalTax = slab1 + slab2; // 22500
        const cess = totalTax * 0.04; // 900
        const expected = Math.round(totalTax + cess); // 23400
        expect(estimateAnnualTax(600000, 'new')).toBe(expected);
      });

      it('calculates tax for all slabs up to 15L', () => {
        // Income of 15 lakh in new regime
        // 0-2.5L: 0% = 0
        // 2.5L-5L: 5% of 2.5L = 12500
        // 5L-7.5L: 10% of 2.5L = 25000
        // 7.5L-10L: 15% of 2.5L = 37500
        // 10L-12.5L: 20% of 2.5L = 50000
        // 12.5L-15L: 25% of 2.5L = 62500
        // Total: 187500 + cess
        const slab1 = 250000 * 0.05; // 12500
        const slab2 = 250000 * 0.1; // 25000
        const slab3 = 250000 * 0.15; // 37500
        const slab4 = 250000 * 0.2; // 50000
        const slab5 = 250000 * 0.25; // 62500
        const totalTax = slab1 + slab2 + slab3 + slab4 + slab5; // 187500
        const cess = totalTax * 0.04; // 7500
        const expected = Math.round(totalTax + cess); // 195000
        expect(estimateAnnualTax(1500000, 'new')).toBe(expected);
      });

      it('calculates 30% tax for income above 15L', () => {
        // Income of 20 lakh
        // All previous slabs + 5L at 30%
        const previousSlabs = 187500; // from previous test
        const topSlab = 500000 * 0.3; // 150000
        const totalTax = previousSlabs + topSlab; // 337500
        const cess = totalTax * 0.04; // 13500
        const expected = Math.round(totalTax + cess); // 351000
        expect(estimateAnnualTax(2000000, 'new')).toBe(expected);
      });
    });

    describe('default regime behavior', () => {
      it('defaults to old regime when no regime specified', () => {
        const oldRegimeTax = estimateAnnualTax(500000, 'old');
        const defaultTax = estimateAnnualTax(500000);
        expect(defaultTax).toBe(oldRegimeTax);
      });
    });

    describe('edge cases', () => {
      it('handles very small positive income', () => {
        expect(estimateAnnualTax(1, 'old')).toBe(0);
        expect(estimateAnnualTax(1, 'new')).toBe(0);
      });

      it('handles exactly slab boundary values', () => {
        // Exactly at 2.5L boundary
        expect(estimateAnnualTax(250000, 'old')).toBe(0);
        expect(estimateAnnualTax(250000, 'new')).toBe(0);

        // Exactly at 5L boundary old regime
        const taxAt5L = 250000 * 0.05; // 12500
        const cessAt5L = taxAt5L * 0.04; // 500
        expect(estimateAnnualTax(500000, 'old')).toBe(Math.round(taxAt5L + cessAt5L));

        // Exactly at 7.5L boundary new regime
        const slab1New = 250000 * 0.05; // 12500
        const slab2New = 250000 * 0.1; // 25000
        const totalTaxNew = slab1New + slab2New; // 37500
        const cessNew = totalTaxNew * 0.04; // 1500
        expect(estimateAnnualTax(750000, 'new')).toBe(Math.round(totalTaxNew + cessNew));
      });

      it('returns integer values (proper rounding)', () => {
        const result = estimateAnnualTax(333333, 'old');
        expect(Number.isInteger(result)).toBe(true);
        expect(result).toBeGreaterThan(0);
      });
    });

    describe('cess calculation', () => {
      it('applies 4% cess on calculated tax', () => {
        // For income where we can verify cess calculation
        const income = 600000; // 6 lakh
        const baseSlabs = (250000 * 0.05) + (100000 * 0.2); // 12500 + 20000 = 32500
        const cess = baseSlabs * 0.04; // 1300
        const expected = Math.round(baseSlabs + cess); // 33800
        expect(estimateAnnualTax(income, 'old')).toBe(expected);
      });
    });
  });

  describe('annualToMonthly', () => {
    it('converts annual amount to monthly with rounding', () => {
      expect(annualToMonthly(12000)).toBe(1000);
      expect(annualToMonthly(13000)).toBe(1083); // 1083.33 rounded
      expect(annualToMonthly(0)).toBe(0);
    });

    it('handles negative values', () => {
      expect(annualToMonthly(-12000)).toBe(-1000);
    });

    it('rounds to nearest integer', () => {
      expect(annualToMonthly(13)).toBe(1); // 1.083 rounded to 1
      expect(annualToMonthly(19)).toBe(2); // 1.583 rounded to 2
      expect(annualToMonthly(5)).toBe(0); // 0.416 rounded to 0
      expect(annualToMonthly(7)).toBe(1); // 0.583 rounded to 1
    });

    it('handles large values', () => {
      expect(annualToMonthly(1200000)).toBe(100000);
      expect(annualToMonthly(999999)).toBe(83333); // 83333.25 rounded
    });
  });

  describe('integration tests', () => {
    it('calculates realistic tax scenarios', () => {
      // Software engineer with 12L annual CTC
      const income12L = 1200000;
      const oldTax = estimateAnnualTax(income12L, 'old');
      const newTax = estimateAnnualTax(income12L, 'new');
      
      // Both regimes should calculate valid tax amounts - no assumption about which is higher
      expect(newTax).toBeGreaterThan(0);
      expect(oldTax).toBeGreaterThan(0);
      // At 12L income level, tax difference varies by specific calculations
      
      // Monthly tax should be reasonable
      const monthlyOld = annualToMonthly(oldTax);
      const monthlyNew = annualToMonthly(newTax);
      expect(monthlyOld).toBeLessThan(income12L / 12); // Tax less than gross
      expect(monthlyNew).toBeLessThan(income12L / 12);
    });

    it('validates tax increases with income', () => {
      const incomes = [300000, 600000, 900000, 1200000];
      const oldTaxes = incomes.map(i => estimateAnnualTax(i, 'old'));
      const newTaxes = incomes.map(i => estimateAnnualTax(i, 'new'));

      // Tax should increase with income
      for (let i = 1; i < oldTaxes.length; i++) {
        expect(oldTaxes[i]).toBeGreaterThan(oldTaxes[i - 1]);
        expect(newTaxes[i]).toBeGreaterThan(newTaxes[i - 1]);
      }
    });
  });
});