import { useState } from 'react';
import type { AppLanguage, BaseProfile } from '../types';
import { getStaticProfile } from '../data/profiles';
import { blankProfile, saveBaseProfile, uniqueBaseProfileId } from '../utils/baseProfiles';
import { nafSection, nafLabel, nafInput } from '../styles/formStyles';

type StartFrom = 'blank' | 'language-default' | `duplicate:${string}`;

interface Props {
  existingProfiles: BaseProfile[];
  onClose: () => void;
  onCreated: (id: string) => void;
}

export function CreateBaseProfileModal({ existingProfiles, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [startFrom, setStartFrom] = useState<StartFrom>('language-default');

  const canCreate = name.trim() !== '';

  const handleCreate = () => {
    if (!canCreate) return;

    const profile = startFrom === 'blank'
      ? blankProfile(language)
      : startFrom === 'language-default'
        ? { ...getStaticProfile(language) }
        : { ...existingProfiles.find((p) => p.id === startFrom.slice('duplicate:'.length))!.profile };

    const id = uniqueBaseProfileId(name);
    const baseProfile: BaseProfile = { id, name: name.trim(), language, profile };
    saveBaseProfile(baseProfile);
    onCreated(id);
  };

  return (
    <div className="fixed inset-0 bg-[rgba(20,28,46,0.65)] flex items-center justify-center z-[100] p-6" onClick={onClose}>
      <div
        className="bg-[#1a2236] rounded-lg w-full max-w-[440px] p-6 flex flex-col gap-4 shadow-[0_20px_60px_rgba(20,28,46,0.40)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="[font-family:var(--font-mono)] text-[12px] font-semibold tracking-[0.04em] uppercase text-[color:var(--ink-invert)]">
          New base profile
        </div>

        <div className={nafSection}>
          <span className={nafLabel}>Name</span>
          <input
            autoFocus
            className={nafInput}
            placeholder="e.g. Backend (EN)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={nafSection}>
          <span className={nafLabel}>Language</span>
          <select
            className={nafInput}
            value={language}
            onChange={(e) => setLanguage(e.target.value as AppLanguage)}
          >
            <option value="en">English 🇬🇧</option>
            <option value="de">Deutsch 🇩🇪</option>
          </select>
        </div>

        <div className={nafSection}>
          <span className={nafLabel}>Start from</span>
          <select
            className={nafInput}
            value={startFrom}
            onChange={(e) => setStartFrom(e.target.value as StartFrom)}
          >
            <option value="language-default">Language default</option>
            <option value="blank">Blank profile</option>
            {existingProfiles.length > 0 && (
              <optgroup label="Duplicate existing">
                {existingProfiles.map((p) => (
                  <option key={p.id} value={`duplicate:${p.id}`}>{p.name}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        <div className="flex justify-end gap-2 mt-1">
          <button
            className="[font-family:var(--font-mono)] text-[11px] bg-transparent text-[color:var(--ink-3)] border border-white/12 rounded px-3.5 py-[6px] cursor-pointer hover:text-[color:var(--ink-invert)]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="[font-family:var(--font-mono)] text-[11px] bg-[color:var(--accent)] text-white border-none rounded px-4 py-[6px] cursor-pointer transition-colors duration-150 hover:bg-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleCreate}
            disabled={!canCreate}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
