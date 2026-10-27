// "100.50" -> 10050. Returns null for anything that isn't a valid amount.
// Parses the string instead of multiplying floats, so there are no rounding errors.
export function rupeesToPaise(input: string): number | null {
  const value = input.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null;
  const [rupees, decimals = ""] = value.split(".");
  return Number(rupees) * 100 + Number(decimals.padEnd(2, "0"));
}

// 10050 -> "100.50" (for pre-filling form inputs)
export function paiseToRupeeString(paise: number): string {
  return (paise / 100).toFixed(2);
}

// 10050 -> "₹100.50" (display only)
export function formatPaise(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(paise / 100);
}