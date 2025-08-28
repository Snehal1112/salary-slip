export type TaxRegime = "old" | "new";

function taxOnSlabs(income: number, slabs: Array<[number, number]>) {
  let remaining = income;
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of slabs) {
    const cap = upper === 0 ? Infinity : upper - lower;
    const taxable = Math.max(0, Math.min(remaining, cap));
    tax += taxable * rate;
    remaining -= taxable;
    lower = upper;
    if (remaining <= 0) break;
  }
  return tax;
}

export function estimateAnnualTax(
  annualTaxableIncome: number,
  regime: TaxRegime = "old"
) {
  if (annualTaxableIncome <= 0) return 0;
  let tax = 0;
  if (regime === "old") {
    // Old regime (approx) cumulative upper limits and marginal rates
    const formatted: Array<[number, number]> = [
      [250000, 0],
      [500000, 0.05],
      [1000000, 0.2],
      [0, 0.3],
    ];
    tax = taxOnSlabs(annualTaxableIncome, formatted);
  } else {
    const formatted: Array<[number, number]> = [
      [250000, 0],
      [500000, 0.05],
      [750000, 0.1],
      [1000000, 0.15],
      [1250000, 0.2],
      [1500000, 0.25],
      [0, 0.3],
    ];
    tax = taxOnSlabs(annualTaxableIncome, formatted);
  }
  const cess = tax * 0.04;
  return Math.max(0, Math.round(tax + cess));
}

export function annualToMonthly(annual: number) {
  return Math.round(annual / 12);
}
