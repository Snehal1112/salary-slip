export function computeProfessionalTax(
  stateName: string,
  monthlyGross: number
) {
  // simplified example rules for a few states (monthly values)
  // Real rules are more complex; these are illustrative
  const rules: Record<string, Array<[number, number]>> = {
    Gujarat: [
      [0, 0],
      [10000, 0],
      [15000, 150],
      [25000, 200],
    ],
    Maharashtra: [
      [0, 0],
      [10000, 0],
      [15000, 150],
      [25000, 200],
    ],
    Karnataka: [
      [0, 0],
      [10000, 0],
      [15000, 150],
      [25000, 200],
    ],
  };
  const list = rules[stateName] || rules["Gujarat"];
  // pick nearest bracket by monthly gross
  let amt = 0;
  for (let i = list.length - 1; i >= 0; i--) {
    if (monthlyGross >= list[i][0]) {
      amt = list[i][1];
      break;
    }
  }
  return amt;
}
