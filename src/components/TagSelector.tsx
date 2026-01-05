'use client';

import { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';

interface TagSelectorProps {
  label: string;
  placeholder?: string;
  availableTags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  maxSelections?: number;
}

export default function TagSelector({
  label,
  placeholder = 'Search or select...',
  availableTags,
  selectedTags,
  onChange,
  maxSelections,
}: TagSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return availableTags;
    const query = searchQuery.toLowerCase();
    return availableTags.filter(tag => tag.toLowerCase().includes(query));
  }, [searchQuery, availableTags]);

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      if (maxSelections && selectedTags.length >= maxSelections) return;
      onChange([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    onChange(selectedTags.filter(t => t !== tag));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm text-white/60">{label}</label>
      
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
          {selectedTags.map(tag => (
            <div
              key={tag}
              className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-sm"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative z-20 max-h-64 overflow-y-auto bg-black border border-white/10 rounded-lg shadow-xl">
            {filteredTags.length === 0 ? (
              <div className="p-4 text-center text-white/40 text-sm">
                No options found
              </div>
            ) : (
              <div className="p-2">
                {filteredTags.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  const isDisabled = !isSelected && maxSelections !== undefined && selectedTags.length >= maxSelections;
                  
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      disabled={isDisabled}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        isSelected
                          ? 'bg-white/10 text-white'
                          : isDisabled
                          ? 'text-white/30 cursor-not-allowed'
                          : 'hover:bg-white/5 text-white/70'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {maxSelections && (
        <p className="text-xs text-white/40">
          {selectedTags.length} / {maxSelections} selected
        </p>
      )}
    </div>
  );
}
