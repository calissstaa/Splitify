// src/app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import PeopleList from "../components/PeopleList";
import ItemList from "../components/ItemList";
import SummaryCard from "../components/SummaryCard";
import Toast from "../components/Toast";
import { useBillSplitter } from "../hooks/useBillSplitter";
import { ToastMessage } from "../types";
import Tesseract from "tesseract.js";
import { parseReceiptText } from "../utils/receiptParser";

export default function Home() {
  const {
    people,
    items,
    tax,
    tip,
    tipType,
    discount,
    discountType,
    splitMode,
    quickSubtotal,
    currency,
    calculations,
    addPerson,
    removePerson,
    addItem,
    removeItem,
    updateItem,
    togglePersonOnItem,
    selectAllOnItem,
    clearAllOnItem,
    setTax,
    setTip,
    setTipType,
    setDiscount,
    setDiscountType,
    setSplitMode,
    setQuickSubtotal,
    setCurrency,
    resetBill,
  } = useBillSplitter();

  // Toast notification state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Theme State ('dark' | 'light')
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Mobile Tab State ('edit' | 'summary')
  const [activeMobileTab, setActiveMobileTab] = useState<"edit" | "summary">("edit");

  // OCR scanner state
  const [isScanning, setIsScanning] = useState(false);

  const handleScanReceipt = async (file: File) => {
    setIsScanning(true);
    showToast("Processing receipt image...", "info");
    try {
      // Perform OCR directly in the user's browser
      const { data: { text } } = await Tesseract.recognize(file, "eng");

      if (!text || !text.trim()) {
        showToast("Could not read any text from the receipt.", "warning");
        return;
      }

      // Parse text lines to extract item name, price, quantity
      const scannedItems = parseReceiptText(text);

      if (scannedItems.length > 0) {
        scannedItems.forEach((scannedItem) => {
          addItem(scannedItem.name, scannedItem.price, scannedItem.quantity);
        });
        showToast(`Successfully scanned ${scannedItems.length} items from receipt!`, "success");
      } else {
        showToast("No items found. Try a clearer image or add manually.", "warning");
      }
    } catch (err: any) {
      console.error("OCR Scanning Error:", err);
      showToast(err.message || "Failed to scan receipt image. Please try again.", "warning");
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("bs_theme") as "dark" | "light" | null;
      if (savedTheme) {
        setTheme(savedTheme);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bs_theme", theme);
      if (theme === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    showToast(`Switched to ${theme === "dark" ? "light" : "dark"} theme`);
  };

  const showToast = (message: string, type: "info" | "success" | "warning" = "info") => {
    const newToast: ToastMessage = {
      id: crypto.randomUUID(),
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCopySuccess = () => {
    showToast("Summary copied to clipboard!", "success");
  };

  return (
    <div className="app-container">
      <Header onReset={resetBill} theme={theme} onToggleTheme={toggleTheme} />

      {/* Mobile view selector */}
      <div className="mobile-tabs-container">
        <button
          onClick={() => setActiveMobileTab("edit")}
          className={`mobile-tab-btn ${activeMobileTab === "edit" ? "active" : ""}`}
        >
          1. Edit Bill
        </button>
        <button
          onClick={() => setActiveMobileTab("summary")}
          className={`mobile-tab-btn ${activeMobileTab === "summary" ? "active" : ""}`}
        >
          2. Split Summary
        </button>
      </div>

      <main className="main-layout">
        {/* Left Side: Setup Bill */}
        <div className={activeMobileTab === "summary" ? "mobile-hide" : ""}>
          {/* Split Mode Selector */}
          <div className="mode-tabs">
            <div
              onClick={() => {
                setSplitMode("itemized");
                showToast("Switched to Itemized Split mode");
              }}
              className={`mode-tab ${splitMode === "itemized" ? "active" : ""}`}
            >
              Itemized Split (Detailed)
            </div>
            <div
              onClick={() => {
                setSplitMode("quick");
                showToast("Switched to Quick Split mode");
              }}
              className={`mode-tab ${splitMode === "quick" ? "active" : ""}`}
            >
              Quick Split (Equal)
            </div>
          </div>

          {/* People list */}
          <PeopleList
            people={people}
            onAddPerson={(name) => {
              addPerson(name);
              showToast(`Added ${name}`, "success");
            }}
            onRemovePerson={(id) => {
              const name = people.find((p) => p.id === id)?.name || "Participant";
              removePerson(id);
              showToast(`Removed ${name}`);
            }}
          />

          {/* Items / Total input */}
          <ItemList
            items={items}
            people={people}
            splitMode={splitMode}
            quickSubtotal={quickSubtotal}
            onQuickSubtotalChange={setQuickSubtotal}
            onAddItem={(name, price, qty) => {
              addItem(name, price, qty);
              showToast(`Added item: ${name}`, "success");
            }}
            onRemoveItem={(id) => {
              const name = items.find((i) => i.id === id)?.name || "Item";
              removeItem(id);
              showToast(`Removed item: ${name}`);
            }}
            onUpdateItem={updateItem}
            onTogglePersonOnItem={togglePersonOnItem}
            onSelectAllOnItem={selectAllOnItem}
            onClearAllOnItem={clearAllOnItem}
            isScanning={isScanning}
            onScanReceipt={handleScanReceipt}
            currency={currency}
          />

          {/* Fees, Tips & Discount Settings Card */}
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
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Taxes, Tips & Discounts
            </h2>
            <p className="section-subtitle">
              Configure extra charges or discounts. These are distributed proportionally.
            </p>

            <div className="settings-grid">
              {/* Tax */}
              <div className="form-group">
                <label className="form-label">Tax (%)</label>
                <div className="input-addon-group">
                  <input
                    type="number"
                    value={tax || ""}
                    onChange={(e) => setTax(Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    className="input-control"
                    min="0"
                    step="0.1"
                  />
                  <span style={{ position: "absolute", right: "1rem", color: "var(--text-muted)" }}>%</span>
                </div>
              </div>

              {/* Tip/Service */}
              <div className="form-group">
                <label className="form-label">Tip/Service</label>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <div className="input-addon-group" style={{ flex: 1 }}>
                    {tipType === "flat" && (
                      <span className="input-addon-prefix" style={{ left: "0.75rem" }}>
                        {currency}
                      </span>
                    )}
                    <input
                      type="number"
                      value={tip || ""}
                      onChange={(e) => setTip(Math.max(0, Number(e.target.value)))}
                      placeholder="0"
                      className="input-control"
                      style={{ paddingLeft: tipType === "flat" ? (currency.length > 1 ? "2.4rem" : "1.75rem") : "0.75rem" }}
                      min="0"
                      step="0.01"
                    />
                    {tipType === "percentage" && (
                      <span style={{ position: "absolute", right: "0.75rem", color: "var(--text-muted)" }}>%</span>
                    )}
                  </div>
                  <select
                    value={tipType}
                    onChange={(e) => {
                      setTipType(e.target.value as any);
                      setTip(0); // reset tip to prevent huge percentages
                    }}
                    className="input-control"
                    style={{ width: "60px", padding: "0.25rem", fontSize: "0.85rem", cursor: "pointer" }}
                  >
                    <option value="flat">{currency}</option>
                    <option value="percentage">%</option>
                  </select>
                </div>
                {/* Presets */}
                {tipType === "percentage" && (
                  <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.4rem" }}>
                    {[10, 15, 18, 20].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setTip(preset);
                          showToast(`Set tip/service to ${preset}%`);
                        }}
                        style={{
                          flex: 1,
                          padding: "0.2rem",
                          fontSize: "0.75rem",
                          background: tip === preset ? "var(--primary)" : "rgba(255, 255, 255, 0.05)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "4px",
                          color: tip === preset ? "#fff" : "var(--text-secondary)",
                          cursor: "pointer",
                          fontWeight: "600",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {preset}%
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Discount */}
              <div className="form-group">
                <label className="form-label">Discount</label>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <div className="input-addon-group" style={{ flex: 1 }}>
                    {discountType === "flat" && (
                      <span className="input-addon-prefix" style={{ left: "0.75rem" }}>
                        {currency}
                      </span>
                    )}
                    <input
                      type="number"
                      value={discount || ""}
                      onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                      placeholder="0"
                      className="input-control"
                      style={{ paddingLeft: discountType === "flat" ? (currency.length > 1 ? "2.4rem" : "1.75rem") : "0.75rem" }}
                      min="0"
                      step="0.01"
                    />
                    {discountType === "percentage" && (
                      <span style={{ position: "absolute", right: "0.75rem", color: "var(--text-muted)" }}>%</span>
                    )}
                  </div>
                  <select
                    value={discountType}
                    onChange={(e) => {
                      setDiscountType(e.target.value as any);
                      setDiscount(0); // reset discount to prevent huge percentages
                    }}
                    className="input-control"
                    style={{ width: "60px", padding: "0.25rem", fontSize: "0.85rem", cursor: "pointer" }}
                  >
                    <option value="flat">{currency}</option>
                    <option value="percentage">%</option>
                  </select>
                </div>
              </div>

              {/* Currency Selector */}
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.target.value);
                    showToast(`Switched currency to ${e.target.value}`);
                  }}
                  className="input-control"
                  style={{ cursor: "pointer" }}
                >
                  <option value="Rp">Rp (IDR)</option>
                  <option value="$">$ (USD)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="£">£ (GBP)</option>
                  <option value="¥">¥ (JPY)</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* Right Side: Totals & Shares Breakdown */}
        <div className={activeMobileTab === "edit" ? "mobile-hide" : ""}>
          <SummaryCard
            people={people}
            calculations={calculations}
            tax={tax}
            tip={tip}
            tipType={tipType}
            discount={discount}
            discountType={discountType}
            splitMode={splitMode}
            onCopySuccess={handleCopySuccess}
            currency={currency}
          />
        </div>
      </main>

      {/* Toast Notification Mount */}
      <div className="toast-container">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={removeToast} />
        ))}
      </div>

    </div>
  );
}
