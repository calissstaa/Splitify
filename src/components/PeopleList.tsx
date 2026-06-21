// src/components/PeopleList.tsx
"use client";

import React, { useState } from "react";
import { Person } from "../types";

interface PeopleListProps {
  people: Person[];
  onAddPerson: (name: string) => void;
  onRemovePerson: (id: string) => void;
}

export default function PeopleList({
  people,
  onAddPerson,
  onRemovePerson,
}: PeopleListProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddPerson(name);
    setName("");
  };

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
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        Who is sharing the bill?
      </h2>
      <p className="section-subtitle">
        Add friends who are participating in this bill split.
      </p>

      <form onSubmit={handleSubmit} className="people-input-wrapper">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name (e.g. Collin, Stella)"
          className="input-control"
          maxLength={20}
        />
        <button type="submit" className="btn-primary">
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
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add
        </button>
      </form>

      {people.length === 0 ? (
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="16" y1="11" x2="22" y2="11" />
          </svg>
          <div>
            <h4 style={{ fontWeight: 600, color: "var(--text-primary)" }}>No participants added yet</h4>
            <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
              Add people above to begin splitting.
            </p>
          </div>
        </div>
      ) : (
        <div className="people-grid">
          {people.map((person) => (
            <div key={person.id} className="person-chip">
              <div
                className="avatar-circle"
                style={{ backgroundColor: person.color }}
              >
                {person.avatar}
              </div>
              <span className="person-name">{person.name}</span>
              <button
                type="button"
                onClick={() => onRemovePerson(person.id)}
                className="btn-remove-person"
                title={`Remove ${person.name}`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
