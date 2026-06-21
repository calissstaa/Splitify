// src/hooks/useBillSplitter.ts
"use client";

import { useState, useEffect, useMemo } from "react";
import { Person, Item, SplitMode, DiscountType, PersonBreakdown } from "../types";

// Helper to generate a random emoji avatar
const EMOJIS = ["🍕", "🍔", "🍟", "🍣", "🌮", "🥗", "🍰", "🍩", "🍷", "🍺", "🍹", "☕", "🍿", "🍳", "🧇", "🥞", "🍝", "🍜", "🦞", "🥩"];
const COLORS = ["#ef4444", "#f97316", "#f59e0b", "#10b981", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#ec4899"];

function getRandomEmoji(): string {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

function getRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function useBillSplitter() {
  const [people, setPeople] = useState<Person[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [tax, setTax] = useState<number>(10); // in %
  const [tip, setTip] = useState<number>(10); // in %
  const [tipType, setTipType] = useState<DiscountType>("percentage");
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<DiscountType>("flat");
  const [splitMode, setSplitMode] = useState<SplitMode>("itemized");
  const [quickSubtotal, setQuickSubtotal] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("Rp");

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedPeople = localStorage.getItem("bs_people");
        const savedItems = localStorage.getItem("bs_items");
        const savedTax = localStorage.getItem("bs_tax");
        const savedTip = localStorage.getItem("bs_tip");
        const savedTipType = localStorage.getItem("bs_tipType");
        const savedDiscount = localStorage.getItem("bs_discount");
        const savedDiscountType = localStorage.getItem("bs_discountType");
        const savedSplitMode = localStorage.getItem("bs_splitMode");
        const savedQuickSubtotal = localStorage.getItem("bs_quickSubtotal");
        const savedCurrency = localStorage.getItem("bs_currency");

        if (savedPeople) setPeople(JSON.parse(savedPeople));
        if (savedItems) setItems(JSON.parse(savedItems));
        if (savedTax) setTax(Number(savedTax));
        if (savedTip) setTip(Number(savedTip));
        if (savedTipType) setTipType(savedTipType as DiscountType);
        if (savedDiscount) setDiscount(Number(savedDiscount));
        if (savedDiscountType) setDiscountType(savedDiscountType as DiscountType);
        if (savedSplitMode) setSplitMode(savedSplitMode as SplitMode);
        if (savedQuickSubtotal) setQuickSubtotal(Number(savedQuickSubtotal));
        if (savedCurrency) setCurrency(savedCurrency);
      } catch (e) {
        console.error("Error loading state from localStorage", e);
      }
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("bs_people", JSON.stringify(people));
        localStorage.setItem("bs_items", JSON.stringify(items));
        localStorage.setItem("bs_tax", tax.toString());
        localStorage.setItem("bs_tip", tip.toString());
        localStorage.setItem("bs_tipType", tipType);
        localStorage.setItem("bs_discount", discount.toString());
        localStorage.setItem("bs_discountType", discountType);
        localStorage.setItem("bs_splitMode", splitMode);
        localStorage.setItem("bs_quickSubtotal", quickSubtotal.toString());
        localStorage.setItem("bs_currency", currency);
      } catch (e) {
        console.error("Error saving state to localStorage", e);
      }
    }
  }, [people, items, tax, tip, tipType, discount, discountType, splitMode, quickSubtotal, currency]);

  // People Actions
  const addPerson = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newPerson: Person = {
      id: crypto.randomUUID(),
      name: trimmed,
      avatar: getRandomEmoji(),
      color: getRandomColor(),
    };
    setPeople((prev) => [...prev, newPerson]);

    // Automatically auto-assign new person to all existing items if desired,
    // or just leave them unassigned. Leaving them unassigned is standard.
  };

  const removePerson = (id: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
    // Remove person from all items assignments
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        assignedTo: item.assignedTo.filter((pid) => pid !== id),
      }))
    );
  };

  // Items Actions
  const addItem = (name: string, price: number, quantity: number = 1) => {
    const trimmed = name.trim();
    if (!trimmed || price < 0 || quantity <= 0) return;
    const newItem: Item = {
      id: crypto.randomUUID(),
      name: trimmed,
      price,
      quantity,
      // By default, assign to everyone if there are people, otherwise empty
      assignedTo: people.map((p) => p.id),
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<Item>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const togglePersonOnItem = (itemId: string, personId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const exists = item.assignedTo.includes(personId);
        return {
          ...item,
          assignedTo: exists
            ? item.assignedTo.filter((pid) => pid !== personId)
            : [...item.assignedTo, personId],
        };
      })
    );
  };

  const selectAllOnItem = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          assignedTo: people.map((p) => p.id),
        };
      })
    );
  };

  const clearAllOnItem = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          assignedTo: [],
        };
      })
    );
  };

  const changeSplitMode = (mode: SplitMode) => {
    if (mode === "quick") {
      const itemsSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      if (itemsSubtotal > 0) {
        setQuickSubtotal(itemsSubtotal);
      }
    }
    setSplitMode(mode);
  };

  const resetBill = () => {
    if (window.confirm("Are you sure you want to clear all people, items, and reset the bill?")) {
      setPeople([]);
      setItems([]);
      setTax(10);
      setTip(10);
      setTipType("percentage");
      setDiscount(0);
      setDiscountType("flat");
      setSplitMode("itemized");
      setQuickSubtotal(0);
      setCurrency("Rp");
      try {
        localStorage.removeItem("bs_people");
        localStorage.removeItem("bs_items");
        localStorage.removeItem("bs_tax");
        localStorage.removeItem("bs_tip");
        localStorage.removeItem("bs_tipType");
        localStorage.removeItem("bs_discount");
        localStorage.removeItem("bs_discountType");
        localStorage.removeItem("bs_splitMode");
        localStorage.removeItem("bs_quickSubtotal");
        localStorage.removeItem("bs_currency");
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Calculations
  const calculations = useMemo(() => {
    // 1. Subtotal
    const subtotal =
      splitMode === "quick"
        ? quickSubtotal
        : items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 2. Tax, Tip, Discount amounts
    const totalTax = (subtotal * tax) / 100;
    const totalTip =
      tipType === "flat" ? tip : (subtotal * tip) / 100;
    const totalDiscount =
      discountType === "flat" ? discount : (subtotal * discount) / 100;

    const grandTotal = Math.max(0, subtotal + totalTax + totalTip - totalDiscount);

    // 3. Set up empty breakdown for each person
    const breakdowns: PersonBreakdown[] = people.map((p) => ({
      personId: p.id,
      subtotal: 0,
      taxShare: 0,
      tipShare: 0,
      discountShare: 0,
      total: 0,
      items: [],
    }));

    if (people.length === 0) {
      return {
        subtotal,
        totalTax,
        totalTip,
        totalDiscount,
        grandTotal,
        breakdowns,
      };
    }

    if (splitMode === "quick") {
      // Split everything equally
      const count = people.length;
      const equalSubtotal = subtotal / count;
      const equalTax = totalTax / count;
      const equalTip = totalTip / count;
      const equalDiscount = totalDiscount / count;
      const equalTotal = grandTotal / count;

      breakdowns.forEach((b) => {
        b.subtotal = equalSubtotal;
        b.taxShare = equalTax;
        b.tipShare = equalTip;
        b.discountShare = equalDiscount;
        b.total = equalTotal;
      });
    } else {
      // Itemized splitting
      // First, attribute item costs
      let totalAssignedSubtotal = 0;

      // Track unassigned items. If any items are assigned to NO ONE, we split their cost equally.
      const unassignedItems: Item[] = [];
      const assignedItemsBreakdown: { item: Item; costPerPerson: number }[] = [];

      items.forEach((item) => {
        const assignees = item.assignedTo;
        if (assignees.length === 0) {
          unassignedItems.push(item);
        } else {
          const costPerPerson = (item.price * item.quantity) / assignees.length;
          assignedItemsBreakdown.push({ item, costPerPerson });
          
          assignees.forEach((pid) => {
            const b = breakdowns.find((breakdown) => breakdown.personId === pid);
            if (b) {
              b.subtotal += costPerPerson;
              b.items.push({
                itemId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                assignedCount: assignees.length,
                shareOfCost: costPerPerson,
              });
            }
          });
          totalAssignedSubtotal += item.price * item.quantity;
        }
      });

      // Split unassigned items equally
      if (unassignedItems.length > 0) {
        const unassignedCost = unassignedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const shareOfUnassigned = unassignedCost / people.length;

        breakdowns.forEach((b) => {
          b.subtotal += shareOfUnassigned;
          unassignedItems.forEach((item) => {
            b.items.push({
              itemId: item.id,
              name: `${item.name} (Shared)`,
              price: item.price,
              quantity: item.quantity,
              assignedCount: people.length,
              shareOfCost: (item.price * item.quantity) / people.length,
            });
          });
        });
        totalAssignedSubtotal += unassignedCost;
      }

      // Proportional tax, tip, and discount allocation
      breakdowns.forEach((b) => {
        // Ratio of this person's subtotal to the total bill subtotal
        const ratio = subtotal > 0 ? b.subtotal / subtotal : 0;
        
        b.taxShare = ratio * totalTax;
        b.tipShare = ratio * totalTip;
        b.discountShare = ratio * totalDiscount;
        b.total = Math.max(0, b.subtotal + b.taxShare + b.tipShare - b.discountShare);
      });
    }

    return {
      subtotal,
      totalTax,
      totalTip,
      totalDiscount,
      grandTotal,
      breakdowns,
    };
  }, [people, items, tax, tip, tipType, discount, discountType, splitMode, quickSubtotal]);

  return {
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
    setSplitMode: changeSplitMode,
    setQuickSubtotal,
    setCurrency,
    resetBill,
  };
}
