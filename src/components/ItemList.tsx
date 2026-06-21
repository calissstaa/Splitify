import React, { useState, useRef } from "react";
import { Item, Person, SplitMode } from "../types";

interface ItemListProps {
  items: Item[];
  people: Person[];
  splitMode: SplitMode;
  quickSubtotal: number;
  onQuickSubtotalChange: (val: number) => void;
  onAddItem: (name: string, price: number, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<Item>) => void;
  onTogglePersonOnItem: (itemId: string, personId: string) => void;
  onSelectAllOnItem: (itemId: string) => void;
  onClearAllOnItem: (itemId: string) => void;
  isScanning: boolean;
  onScanReceipt: (file: File) => void;
  currency: string;
}

export default function ItemList({
  items,
  people,
  splitMode,
  quickSubtotal,
  onQuickSubtotalChange,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onTogglePersonOnItem,
  onSelectAllOnItem,
  onClearAllOnItem,
  isScanning,
  onScanReceipt,
  currency,
}: ItemListProps) {
  // Add item form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatVal = (val: number) => {
    if (currency === "Rp") {
      return "Rp " + Math.round(val).toLocaleString("id-ID");
    }
    if (currency === "¥") {
      return "¥" + Math.round(val).toLocaleString("ja-JP");
    }
    return currency + val.toFixed(2);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onScanReceipt(file);
      e.target.value = "";
    }
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || Number(price) < 0 || Number(quantity) <= 0) return;
    onAddItem(name, Number(price), Number(quantity));
    setName("");
    setPrice("");
    setQuantity("1");
  };

  if (splitMode === "quick") {
    return (
      <section className="glass-card" style={{ marginBottom: "1.5rem" }}>
        <h2 className="section-title">
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
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <line x1="12" y1="4" x2="12" y2="20" />
          </svg>
          Quick Split Total
        </h2>
        <p className="section-subtitle">
          Enter the subtotal of the bill to split it equally among all participants.
        </p>
        <div className="form-group" style={{ maxWidth: "300px" }}>
          <label className="form-label">Subtotal Amount</label>
          <div className="input-addon-group">
            <span className="input-addon-prefix">{currency}</span>
            <input
              type="number"
              value={quickSubtotal || ""}
              onChange={(e) => onQuickSubtotalChange(Math.max(0, Number(e.target.value)))}
              placeholder="0.00"
              className="input-control"
              style={{ paddingLeft: currency.length > 1 ? "2.6rem" : "2rem" }}
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="glass-card" style={{ marginBottom: "1.5rem" }}>
      <h2 className="section-title">
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
          <path d="M5.62 21H18.38a2 2 0 0 0 1.95-1.57L22.09 10H1.91L3.67 19.43A2 2 0 0 0 5.62 21z" />
          <path d="M12 2v8" />
          <path d="M19 10l-4-8" />
          <path d="M5 10l4-8" />
        </svg>
        Items Purchased
      </h2>
      <p className="section-subtitle">
        Add individual items and assign who ordered them. Unassigned items are split equally.
      </p>

      {/* Add Item Row */}
      <form onSubmit={handleAddItemSubmit} className="add-item-card" style={{ marginBottom: "1.5rem" }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Item Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ribeye Steak"
            className="input-control"
            required
          />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Price</label>
          <div className="input-addon-group">
            <span className="input-addon-prefix">{currency}</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="input-control"
              style={{ paddingLeft: currency.length > 1 ? "2.6rem" : "2rem" }}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Qty</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="1"
            className="input-control"
            min="1"
            required
          />
        </div>
        <button type="submit" className="btn-primary" style={{ height: "42px" }}>
          Add Item
        </button>
      </form>

      {/* AI Scan Container */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn-primary"
          style={{
            flex: 1,
            background: "linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)",
            height: "42px",
            boxShadow: "0 4px 15px var(--primary-glow)",
          }}
          disabled={isScanning}
        >
          {isScanning ? (
            <>
              <svg
                style={{
                  animation: "spin 1s linear infinite",
                  marginRight: "0.5rem",
                  width: "18px",
                  height: "18px",
                }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" />
                <path fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Scanning Receipt...
            </>
          ) : (
            <>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: "0.5rem" }}
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Scan Receipt (AI Auto-Load)
            </>
          )}
        </button>
      </div>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="empty-state">
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
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <div>
            <h4 style={{ fontWeight: 600, color: "var(--text-primary)" }}>No items added yet</h4>
            <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
              Add items using the form above to build your bill breakdown.
            </p>
          </div>
        </div>
      ) : (
        <div className="items-container">
          {items.map((item) => {
            const itemTotal = item.price * item.quantity;
            return (
              <div key={item.id} className="item-row">
                <div className="item-header">
                  <div className="item-title-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-details">
                      {formatVal(item.price)} × {item.quantity} ={" "}
                      <strong style={{ color: "var(--text-primary)" }}>
                        {formatVal(itemTotal)}
                      </strong>
                    </span>
                  </div>

                  <div className="flex-row-center">
                    {/* Inline edit price */}
                    <div className="input-addon-group" style={{ width: "110px" }}>
                      <span className="input-addon-prefix" style={{ left: "0.45rem", fontSize: "0.85rem" }}>
                        {currency}
                      </span>
                      <input
                        type="number"
                        value={item.price || ""}
                        onChange={(e) =>
                          onUpdateItem(item.id, {
                            price: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="input-control"
                        style={{
                          padding: "0.35rem 0.5rem 0.35rem 1.6rem",
                          paddingLeft: currency.length > 1 ? "1.9rem" : "1.3rem",
                          fontSize: "0.85rem",
                        }}
                        min="0"
                        step="0.01"
                        title="Adjust price"
                      />
                    </div>

                    {/* Inline edit quantity */}
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        onUpdateItem(item.id, {
                          quantity: Math.max(1, Number(e.target.value)),
                        })
                      }
                      className="input-control"
                      style={{ width: "50px", padding: "0.35rem", textAlign: "center" }}
                      min="1"
                      title="Adjust quantity"
                    />
                    
                    {/* Delete Item */}
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="btn-icon-only btn-danger-icon"
                      title="Remove item"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                </div>

                {people.length > 0 && (
                  <div>
                    <div className="item-assignees-title">
                      <span>Shared By ({item.assignedTo.length})</span>
                      <div className="item-assignees-actions">
                        <button
                          type="button"
                          onClick={() => onSelectAllOnItem(item.id)}
                          className="btn-text-action"
                        >
                          Everyone
                        </button>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>|</span>
                        <button
                          type="button"
                          onClick={() => onClearAllOnItem(item.id)}
                          className="btn-text-action"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="assignee-picker-grid" style={{ marginTop: "0.5rem" }}>
                      {people.map((person) => {
                        const isSelected = item.assignedTo.includes(person.id);
                        return (
                          <div
                            key={person.id}
                            onClick={() => onTogglePersonOnItem(item.id, person.id)}
                            className={`assignee-chip-selectable ${
                              isSelected ? "selected" : ""
                            }`}
                            style={
                              isSelected
                                ? ({
                                    "--primary": person.color,
                                    "--primary-glow": `${person.color}25`,
                                    borderColor: person.color,
                                  } as React.CSSProperties)
                                : {}
                            }
                          >
                            <span style={{ fontSize: "0.9rem" }}>{person.avatar}</span>
                            <span>{person.name}</span>
                            {isSelected && (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ marginLeft: "0.15rem" }}
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
