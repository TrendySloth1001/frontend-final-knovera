'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Cpu, Info } from 'lucide-react';

interface OllamaModel {
  name: string;
  displayName: string;
  tag: string;
  size: string;
  sizeBytes: number;
  purpose: string;
  hasAPI: boolean;
  modified: string;
  family: string;
  parameterSize: string;
}

interface ModelSelectorProps {
  selectedModel?: string;
  onModelChange?: (model: string) => void;
}

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const fetchModels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/ai/models`);
      const data = await response.json();
      if (data.success) {
        setModels(data.models);
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get simplified model display name
  const getSimplifiedName = (model: OllamaModel): string => {
    const name = model.name.toLowerCase();
    
    // Extract parameter size (like 3b, 7b, 14b)
    const sizeMatch = name.match(/(\d+)b/);
    const size = sizeMatch ? sizeMatch[1] + 'B' : '';
    
    // Determine tier based on size and model type
    if (name.includes('deepseek')) {
      if (size === '14B') return 'KAi 14B Reasoning';
      if (size === '7B') return 'KAi 7B Reasoning';
      return 'KAi DeepSeek';
    }
    
    if (name.includes('qwen')) {
      if (size === '3B' || size === '1B') return 'KAi ' + size + ' General';
      if (size === '7B') return 'KAi 7B Pro';
      if (size === '14B' || size === '32B') return 'KAi ' + size + ' Advanced';
      return 'KAi Qwen';
    }
    
    if (name.includes('llama')) {
      if (size === '3B') return 'KAi 3B General';
      if (size === '7B') return 'KAi 7B Pro';
      if (size === '13B' || size === '14B') return 'KAi 14B Advanced';
      if (size === '70B') return 'KAi 70B Expert';
      return 'KAi Llama';
    }
    
    if (name.includes('mistral')) {
      if (size === '7B') return 'KAi 7B Pro';
      if (size === '8B') return 'KAi 8B Pro';
      return 'KAi Mistral';
    }
    
    // Default fallback
    if (size) return 'KAi ' + size + ' Model';
    return 'KAi ' + model.displayName;
  };

  const currentModel = models.find(m => m.name === selectedModel) || models[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Capsule Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-[30px] px-3 rounded-full bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all flex items-center gap-1.5 group"
        title={currentModel ? getSimplifiedName(currentModel) : 'Select model'}
      >
        <Cpu size={12} className="text-white/60 group-hover:text-white/80" />
        <span className="text-xs font-medium text-white/80 group-hover:text-white">
          {currentModel ? getSimplifiedName(currentModel) : 'Model'}
        </span>
        <ChevronDown 
          size={12} 
          className={`text-white/60 group-hover:text-white/80 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-48 max-h-80 overflow-y-auto custom-scrollbar bg-black border border-white/20 rounded-lg shadow-xl z-50">
          <div className="sticky top-0 bg-black border-b border-white/10 px-3 py-2">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-white/60" />
              <span className="text-sm font-semibold text-white">AI Models</span>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <p className="text-xs text-white/40 mt-2">Loading models...</p>
            </div>
          ) : models.length === 0 ? (
            <div className="p-8 text-center">
              <Info size={24} className="text-white/40 mx-auto mb-2" />
              <p className="text-xs text-white/60">No models found</p>
              <p className="text-xs text-white/40 mt-1">Make sure Ollama is running</p>
            </div>
          ) : (
            <div className="p-2">
              {models.map((model) => {
                const isSelected = selectedModel === model.name;
                
                return (
                  <button
                    key={model.name}
                    onClick={() => {
                      console.log('[ModelSelector] Model selected:', model.name);
                      if (onModelChange) {
                        onModelChange(model.name);
                      }
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      isSelected 
                        ? 'bg-blue-500/20 border border-blue-500/40' 
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-medium ${isSelected ? 'text-blue-300' : 'text-white'}`}>
                        {getSimplifiedName(model)}
                      </span>
                      {isSelected && (
                        <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded">
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="sticky bottom-0 bg-black border-t border-white/10 p-2">
            <button
              onClick={fetchModels}
              className="w-full px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition-colors"
            >
              ↻ Refresh Models
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
