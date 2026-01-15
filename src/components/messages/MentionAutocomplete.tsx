import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface Member {
  userId: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  role: string;
}

interface MentionAutocompleteProps {
  members: Member[];
  query: string;
  onSelect: (member: Member) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export default function MentionAutocomplete({
  members,
  query,
  onSelect,
  onClose,
  position,
}: MentionAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter members based on query
  const filteredMembers = members.filter(
    (member) =>
      member.displayName.toLowerCase().includes(query.toLowerCase()) ||
      member.username.toLowerCase().includes(query.toLowerCase())
  );

  // Debug logging
  useEffect(() => {
    console.log('[MentionAutocomplete] Rendering with:', {
      totalMembers: members.length,
      filteredMembers: filteredMembers.length,
      query,
      position
    });
  }, [members.length, filteredMembers.length, query, position]);

  // Reset selected index when filtered members change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredMembers.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredMembers.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredMembers[selectedIndex]) {
            onSelect(filteredMembers[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredMembers, selectedIndex, onSelect, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (containerRef.current) {
      const selectedElement = containerRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const dropdownContent = (
    <>
      {filteredMembers.length === 0 ? (
        <div
          className="fixed z-[9999] bg-black border border-zinc-800 rounded-lg shadow-xl p-2 min-w-[200px]"
          style={{
            top: position.top,
            left: position.left
          }}
        >
          <div className="text-sm text-zinc-400 px-3 py-2">
            No members found
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="fixed z-[9999] bg-black border border-zinc-800 rounded-lg shadow-xl overflow-hidden max-h-[300px] overflow-y-auto min-w-[250px]"
          style={{
            top: position.top,
            left: position.left,
            transform: 'translateY(-100%)'
          }}
        >
          {filteredMembers.map((member, index) => (
            <div
              key={member.userId}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${index === selectedIndex
                  ? 'bg-zinc-900 border-l-2 border-white'
                  : 'hover:bg-black'
                }`}
              onClick={() => onSelect(member)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.displayName}
                  className="w-8 h-8 rounded-full object-cover border border-zinc-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white font-semibold text-xs border border-zinc-700">
                  {member.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {member.displayName}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  if (typeof window === 'undefined') return null;

  return createPortal(dropdownContent, document.body);
}
