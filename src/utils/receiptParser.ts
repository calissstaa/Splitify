// src/utils/receiptParser.ts

export interface ParsedReceiptItem {
  name: string;
  price: number;
  quantity: number;
}

export function parseReceiptText(text: string): ParsedReceiptItem[] {
  const lines = text.split("\n");
  const items: ParsedReceiptItem[] = [];

  // Keywords indicating lines we should ignore (tax, total, payments, restaurant metadata)
  const excludeKeywords = [
    "tax", "taxable", "subtotal", "sub total", "total", "grand total",
    "discount", "promo", "voucher", "gst", "vat", "service charge",
    "cash", "change", "visa", "mastercard", "amex", "card", "payment",
    "rounding", "balance", "due", "tendered", "auth", "merchant", "receipt",
    "table", "guest", "check", "order", "date", "time", "terminal"
  ];

  lines.forEach((line) => {
    const cleaned = line.trim();
    if (!cleaned) return;

    // Convert to lowercase for keyword check
    const lower = cleaned.toLowerCase();
    const shouldExclude = excludeKeywords.some((keyword) => lower.includes(keyword));
    if (shouldExclude) return;

    // Match decimal prices (e.g. 10.99, $14.50, or trailing numbers like 5.00)
    // Matches a decimal number optionally preceded by a dollar sign and whitespace
    const priceRegex = /(?:\$?\s*)(\d+\.\d{2})(?!\d)/;
    const match = cleaned.match(priceRegex);

    if (match) {
      const priceStr = match[1];
      const price = parseFloat(priceStr);
      if (isNaN(price) || price <= 0 || price > 9999) return; // avoid unrealistic figures or page numbers

      // Extract item name by removing the price string
      let name = cleaned.replace(match[0], "").trim();
      
      // Clean up punctuation, leading/trailing spaces, and bullet points
      name = name
        .replace(/^[\s$*#@+\-|]+/, "")
        .replace(/[\s$*#@+\-|]+$/, "")
        .trim();

      // Check for quantity indicators
      let quantity = 1;
      
      // 1. Leading quantity format e.g. "2 x Burger" or "3x Fries"
      const qtyPrefixRegex = /^(\d+)\s*[xX*]\s*/;
      const qtyPrefixMatch = name.match(qtyPrefixRegex);
      if (qtyPrefixMatch) {
        quantity = parseInt(qtyPrefixMatch[1]);
        name = name.replace(qtyPrefixRegex, "").trim();
      } else {
        // 2. Trailing quantity format e.g. "Burger 2" or "Fries 1"
        const qtySuffixRegex = /\s+(\d+)$/;
        const qtySuffixMatch = name.match(qtySuffixRegex);
        if (qtySuffixMatch) {
          const qtyVal = parseInt(qtySuffixMatch[1]);
          // only parse as quantity if it's a small reasonable count (1-15)
          if (qtyVal > 0 && qtyVal <= 15) {
            quantity = qtyVal;
            name = name.replace(qtySuffixRegex, "").trim();
          }
        }
      }

      // Cleanup spacing
      name = name.replace(/\s+/g, " ");

      // Only add if the name has some reasonable letters
      if (name.length >= 2 && !/^\d+$/.test(name)) {
        items.push({ name, price, quantity });
      }
    }
  });

  return items;
}
