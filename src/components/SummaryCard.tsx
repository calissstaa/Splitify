// src/components/SummaryCard.tsx
"use client";

import React, { useState } from "react";
import { Person, PersonBreakdown, SplitMode, DiscountType } from "../types";

interface SummaryCardProps {
  people: Person[];
  calculations: {
    subtotal: number;
    totalTax: number;
    totalTip: number;
    totalDiscount: number;
    grandTotal: number;
    breakdowns: PersonBreakdown[];
  };
  tax: number;
  tip: number;
  tipType: DiscountType;
  discount: number;
  discountType: DiscountType;
  splitMode: SplitMode;
  onCopySuccess: () => void;
  currency: string;
}

export default function SummaryCard({
  people,
  calculations,
  tax,
  tip,
  tipType,
  discount,
  discountType,
  splitMode,
  onCopySuccess,
  currency,
}: SummaryCardProps) {
  const [expandedPersonId, setExpandedPersonId] = useState<string | null>(null);

  const formatVal = (val: number) => {
    if (currency === "Rp") {
      return "Rp " + Math.round(val).toLocaleString("id-ID");
    }
    if (currency === "¥") {
      return "¥" + Math.round(val).toLocaleString("ja-JP");
    }
    return currency + val.toFixed(2);
  };

  const toggleExpand = (id: string) => {
    setExpandedPersonId(expandedPersonId === id ? null : id);
  };

  const generateShareText = () => {
    let text = `💸 *SPLITIFY BILL BREAKDOWN* 💸\n`;
    text += `==============================\n`;
    text += `Subtotal: ${formatVal(calculations.subtotal)}\n`;
    if (calculations.totalTax > 0) {
      text += `Tax (${tax}%): ${formatVal(calculations.totalTax)}\n`;
    }
    if (calculations.totalTip > 0) {
      const tipStr = tipType === "percentage" ? ` (${tip}%)` : "";
      text += `Tip/Service${tipStr}: ${formatVal(calculations.totalTip)}\n`;
    }
    if (calculations.totalDiscount > 0) {
      const discStr = discountType === "percentage" ? ` (${discount}%)` : "";
      text += `Discount${discStr}: -${formatVal(calculations.totalDiscount)}\n`;
    }
    text += `------------------------------\n`;
    text += `💰 *GRAND TOTAL: ${formatVal(calculations.grandTotal)}*\n`;
    text += `==============================\n\n`;

    text += `👤 *INDIVIDUAL SHARES:*\n`;

    calculations.breakdowns.forEach((b) => {
      const person = people.find((p) => p.id === b.personId);
      if (!person) return;

      text += `\n${person.avatar} *${person.name}*: *${formatVal(b.total)}*\n`;
      text += `   - Subtotal: ${formatVal(b.subtotal)}\n`;
      if (b.taxShare > 0) text += `   - Tax Share: ${formatVal(b.taxShare)}\n`;
      if (b.tipShare > 0) text += `   - Tip/Service Share: ${formatVal(b.tipShare)}\n`;
      if (b.discountShare > 0) text += `   - Discount Share: -${formatVal(b.discountShare)}\n`;

      if (splitMode === "itemized" && b.items.length > 0) {
        text += `   - Items ordered:\n`;
        b.items.forEach((item) => {
          const splitStr =
            item.assignedCount > 1 ? ` (Split by ${item.assignedCount})` : "";
          text += `     • ${item.name} × ${item.quantity} = ${formatVal(item.shareOfCost)}${splitStr}\n`;
        });
      }
    });

    text += `\nShared with Splitify! 🚀`;
    return text;
  };

  const handleCopySummary = () => {
    const text = generateShareText();
    navigator.clipboard.writeText(text).then(() => {
      onCopySuccess();
    });
  };

  return (
    <div className="summary-container">
      <section className="glass-card">
        {/* Bill Total Hero */}
        <div className="bill-total-hero">
          <h3 className="hero-label">Grand Total</h3>
          <div className="hero-amount">
            {formatVal(calculations.grandTotal)}
          </div>
          <div className="hero-subtotals">
            <div className="subtotal-item">
              <span style={{ fontSize: "0.75rem" }}>Subtotal</span>
              <span className="subtotal-val">{formatVal(calculations.subtotal)}</span>
            </div>
            <div className="subtotal-item">
              <span style={{ fontSize: "0.75rem" }}>Tax & Tip/Service</span>
              <span className="subtotal-val" style={{ color: "var(--primary)" }}>
                +{formatVal(calculations.totalTax + calculations.totalTip)}
              </span>
            </div>
            {calculations.totalDiscount > 0 && (
              <div className="subtotal-item">
                <span style={{ fontSize: "0.75rem" }}>Discount</span>
                <span className="subtotal-val" style={{ color: "var(--danger)" }}>
                  -{formatVal(calculations.totalDiscount)}
                </span>
              </div>
            )}
          </div>
        </div>

        <h2 className="section-title" style={{ marginTop: "1rem" }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          Individual Split Breakdown
        </h2>

        {people.length === 0 ? (
          <div className="empty-state" style={{ padding: "2rem 1rem" }}>
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <div>
              <h4 style={{ fontWeight: 600 }}>No calculations yet</h4>
              <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                Add participants and items to see your split results.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="debts-list">
              {calculations.breakdowns.map((b) => {
                const person = people.find((p) => p.id === b.personId);
                if (!person) return null;
                const isExpanded = expandedPersonId === person.id;

                return (
                  <div key={b.personId} className="debt-item-card">
                    <div
                      className="debt-item-summary"
                      onClick={() => toggleExpand(person.id)}
                    >
                      <div className="debt-user-info">
                        <div
                          className="avatar-circle"
                          style={{
                            backgroundColor: person.color,
                            width: "2.2rem",
                            height: "2.2rem",
                            fontSize: "1.05rem",
                          }}
                        >
                          {person.avatar}
                        </div>
                        <div>
                          <h4 style={{ fontWeight: 700, fontSize: "1rem" }}>
                            {person.name}
                          </h4>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            Click to {isExpanded ? "hide" : "view"} details
                          </span>
                        </div>
                      </div>

                      <div className="debt-amount-side">
                        <span className="debt-amount">{formatVal(b.total)}</span>
                        <span className="debt-subshare">
                          Subtotal: {formatVal(b.subtotal)}
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="debt-details-expand">
                        <div className="debt-detail-row">
                          <span>Items Share (Subtotal):</span>
                          <span>{formatVal(b.subtotal)}</span>
                        </div>
                        {b.taxShare > 0 && (
                          <div className="debt-detail-row">
                            <span>Tax Share:</span>
                            <span style={{ color: "var(--text-secondary)" }}>
                              +{formatVal(b.taxShare)}
                            </span>
                          </div>
                        )}
                        {b.tipShare > 0 && (
                          <div className="debt-detail-row">
                            <span>Tip/Service Share:</span>
                            <span style={{ color: "var(--text-secondary)" }}>
                              +{formatVal(b.tipShare)}
                            </span>
                          </div>
                        )}
                        {b.discountShare > 0 && (
                          <div className="debt-detail-row">
                            <span>Discount Share:</span>
                            <span style={{ color: "var(--danger)" }}>
                              -{formatVal(b.discountShare)}
                            </span>
                          </div>
                        )}
                        <div className="debt-detail-row bold">
                          <span>Grand Total Share:</span>
                          <span style={{ color: "var(--success)" }}>
                            {formatVal(b.total)}
                          </span>
                        </div>

                        {splitMode === "itemized" && b.items.length > 0 && (
                          <div
                            style={{
                              marginTop: "0.5rem",
                              background: "rgba(0,0,0,0.15)",
                              padding: "0.5rem",
                              borderRadius: "var(--border-radius-sm)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                color: "var(--text-muted)",
                                marginBottom: "0.25rem",
                              }}
                            >
                              Details
                            </div>
                            {b.items.map((item, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  fontSize: "0.8rem",
                                  color: "var(--text-secondary)",
                                  padding: "0.15rem 0",
                                }}
                              >
                                <span>
                                  {item.name} × {item.quantity}
                                  {item.assignedCount > 1 && (
                                    <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                                      {" "}
                                      (Split by {item.assignedCount})
                                    </span>
                                  )}
                                </span>
                                <span>{formatVal(item.shareOfCost)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleCopySummary}
              className="btn-primary"
              style={{ width: "100%", marginTop: "1rem" }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy Text Summary
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
