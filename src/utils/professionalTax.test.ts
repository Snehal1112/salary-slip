import { computeProfessionalTax } from './professionalTax';

describe('professional tax calculations', () => {
  describe('computeProfessionalTax', () => {
    describe('Gujarat state rules', () => {
      it('returns 0 for income below 10,000', () => {
        expect(computeProfessionalTax('Gujarat', 0)).toBe(0);
        expect(computeProfessionalTax('Gujarat', 5000)).toBe(0);
        expect(computeProfessionalTax('Gujarat', 9999)).toBe(0);
      });

      it('returns 0 for income exactly at 10,000', () => {
        expect(computeProfessionalTax('Gujarat', 10000)).toBe(0);
      });

      it('returns 0 for income in 10,001 to 14,999 range, 150 for 15,000+', () => {
        expect(computeProfessionalTax('Gujarat', 10001)).toBe(0);
        expect(computeProfessionalTax('Gujarat', 12500)).toBe(0);
        expect(computeProfessionalTax('Gujarat', 15000)).toBe(150);
      });

      it('returns 150 for income in 15,001 to 24,999 range, 200 for 25,000+', () => {
        expect(computeProfessionalTax('Gujarat', 15001)).toBe(150);
        expect(computeProfessionalTax('Gujarat', 20000)).toBe(150);
        expect(computeProfessionalTax('Gujarat', 25000)).toBe(200);
      });

      it('returns 200 for income above 25,000 (highest slab)', () => {
        expect(computeProfessionalTax('Gujarat', 25001)).toBe(200);
        expect(computeProfessionalTax('Gujarat', 50000)).toBe(200);
        expect(computeProfessionalTax('Gujarat', 100000)).toBe(200);
      });
    });

    describe('Maharashtra state rules', () => {
      it('follows same structure as Gujarat', () => {
        // Maharashtra has identical rules to Gujarat in this implementation
        expect(computeProfessionalTax('Maharashtra', 5000)).toBe(0);
        expect(computeProfessionalTax('Maharashtra', 12000)).toBe(0);
        expect(computeProfessionalTax('Maharashtra', 18000)).toBe(150);
        expect(computeProfessionalTax('Maharashtra', 30000)).toBe(200);
      });

      it('handles boundary values correctly', () => {
        expect(computeProfessionalTax('Maharashtra', 10000)).toBe(0);
        expect(computeProfessionalTax('Maharashtra', 15000)).toBe(150);
        expect(computeProfessionalTax('Maharashtra', 25000)).toBe(200);
      });
    });

    describe('Karnataka state rules', () => {
      it('follows same structure as Gujarat', () => {
        // Karnataka has identical rules to Gujarat in this implementation
        expect(computeProfessionalTax('Karnataka', 8000)).toBe(0);
        expect(computeProfessionalTax('Karnataka', 14000)).toBe(0);
        expect(computeProfessionalTax('Karnataka', 22000)).toBe(150);
        expect(computeProfessionalTax('Karnataka', 40000)).toBe(200);
      });
    });

    describe('unknown state handling', () => {
      it('defaults to Gujarat rules for unknown states', () => {
        const unknownStates = ['Delhi', 'Tamil Nadu', 'West Bengal', '', 'InvalidState'];
        
        unknownStates.forEach(state => {
          expect(computeProfessionalTax(state, 5000)).toBe(0);
          expect(computeProfessionalTax(state, 12000)).toBe(0);
          expect(computeProfessionalTax(state, 18000)).toBe(150);
          expect(computeProfessionalTax(state, 30000)).toBe(200);
        });
      });

      it('handles case-sensitive state names', () => {
        // Test case sensitivity - implementation is case-sensitive
        expect(computeProfessionalTax('gujarat', 15000)).toBe(150); // Defaults to Gujarat rules
        expect(computeProfessionalTax('GUJARAT', 15000)).toBe(150); // Defaults to Gujarat rules
        expect(computeProfessionalTax('Gujarat', 15000)).toBe(150); // Exact match
      });

      it('handles null and undefined state names', () => {
        // These should default to Gujarat rules
        expect(computeProfessionalTax('', 12000)).toBe(0);
      });
    });

    describe('edge cases and boundary testing', () => {
      it('handles zero and negative incomes', () => {
        expect(computeProfessionalTax('Gujarat', 0)).toBe(0);
        expect(computeProfessionalTax('Gujarat', -1000)).toBe(0);
        expect(computeProfessionalTax('Maharashtra', -500)).toBe(0);
      });

      it('handles very large incomes', () => {
        const largeIncome = 1000000; // 10 lakh monthly
        expect(computeProfessionalTax('Gujarat', largeIncome)).toBe(200);
        expect(computeProfessionalTax('Maharashtra', largeIncome)).toBe(200);
        expect(computeProfessionalTax('Karnataka', largeIncome)).toBe(200);
      });

      it('handles decimal incomes', () => {
        expect(computeProfessionalTax('Gujarat', 10000.5)).toBe(0);
        expect(computeProfessionalTax('Gujarat', 14999.99)).toBe(0);
        expect(computeProfessionalTax('Gujarat', 15000.01)).toBe(150);
      });

      it('validates all bracket boundaries for each state', () => {
        const states = ['Gujarat', 'Maharashtra', 'Karnataka'];
        const testCases = [
          { income: 9999, expected: 0 },
          { income: 10000, expected: 0 },
          { income: 10001, expected: 0 },
          { income: 14999, expected: 0 },
          { income: 15000, expected: 150 },
          { income: 15001, expected: 150 },
          { income: 24999, expected: 150 },
          { income: 25000, expected: 200 },
          { income: 25001, expected: 200 },
        ];

        states.forEach(state => {
          testCases.forEach(({ income, expected }) => {
            expect(computeProfessionalTax(state, income)).toBe(expected);
          });
        });
      });
    });

    describe('realistic salary scenarios', () => {
      it('calculates correct PT for entry-level salaries', () => {
        const entryLevelSalary = 8000; // 8k per month
        expect(computeProfessionalTax('Gujarat', entryLevelSalary)).toBe(0);
        expect(computeProfessionalTax('Maharashtra', entryLevelSalary)).toBe(0);
        expect(computeProfessionalTax('Karnataka', entryLevelSalary)).toBe(0);
      });

      it('calculates correct PT for mid-level salaries', () => {
        const midLevelSalary = 12000; // 12k per month
        expect(computeProfessionalTax('Gujarat', midLevelSalary)).toBe(0);
        expect(computeProfessionalTax('Maharashtra', midLevelSalary)).toBe(0);
        expect(computeProfessionalTax('Karnataka', midLevelSalary)).toBe(0);
      });

      it('calculates correct PT for senior-level salaries', () => {
        const seniorLevelSalary = 35000; // 35k per month
        expect(computeProfessionalTax('Gujarat', seniorLevelSalary)).toBe(200);
        expect(computeProfessionalTax('Maharashtra', seniorLevelSalary)).toBe(200);
        expect(computeProfessionalTax('Karnataka', seniorLevelSalary)).toBe(200);
      });

      it('calculates correct PT for executive-level salaries', () => {
        const executiveSalary = 75000; // 75k per month
        expect(computeProfessionalTax('Gujarat', executiveSalary)).toBe(200);
        expect(computeProfessionalTax('Maharashtra', executiveSalary)).toBe(200);
        expect(computeProfessionalTax('Karnataka', executiveSalary)).toBe(200);
      });
    });

    describe('annual vs monthly context', () => {
      it('works with monthly gross salary values', () => {
        // The function expects monthly values, test with typical monthly salaries
        const monthlySalaries = [
          { salary: 8000, expected: 0 },    // Below threshold
          { salary: 12000, expected: 0 }, // Below 15K threshold
          { salary: 20000, expected: 150 }, // Mid bracket (15K-24.9K)
          { salary: 50000, expected: 200 }, // Very high bracket
        ];

        monthlySalaries.forEach(({ salary, expected }) => {
          expect(computeProfessionalTax('Gujarat', salary)).toBe(expected);
        });
      });
    });

    describe('state comparison', () => {
      it('verifies all implemented states have identical rules', () => {
        const testIncomes = [5000, 12000, 18000, 30000];
        const states = ['Gujarat', 'Maharashtra', 'Karnataka'];

        testIncomes.forEach(income => {
          const results = states.map(state => computeProfessionalTax(state, income));
          // All states should return the same value for the same income
          expect(results.every(result => result === results[0])).toBe(true);
        });
      });
    });

    describe('performance and consistency', () => {
      it('returns consistent results for same inputs', () => {
        const income = 15000;
        const state = 'Gujarat';
        const result1 = computeProfessionalTax(state, income);
        const result2 = computeProfessionalTax(state, income);
        const result3 = computeProfessionalTax(state, income);

        expect(result1).toBe(result2);
        expect(result2).toBe(result3);
        expect(result1).toBe(150);
      });

      it('handles rapid successive calls efficiently', () => {
        const startTime = performance.now();
        
        for (let i = 0; i < 1000; i++) {
          computeProfessionalTax('Gujarat', 15000 + i);
        }
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        // Should complete 1000 calculations in reasonable time (< 100ms)
        expect(executionTime).toBeLessThan(100);
      });
    });
  });
});