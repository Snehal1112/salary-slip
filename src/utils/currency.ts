export const formatCurrency = (value: number, currency = "INR") => {
  try {
    const locale = currency === "INR" ? "en-IN" : "en-US";
    const opts: Intl.NumberFormatOptions = {
      style: "currency",
      currency: currency === "INR" ? "INR" : currency,
      maximumFractionDigits: 2,
    };
    return new Intl.NumberFormat(locale, opts).format(value);
  } catch {
    return String(value);
  }
};

export const sumLineItems = (items: { amount: number }[]) =>
  items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
