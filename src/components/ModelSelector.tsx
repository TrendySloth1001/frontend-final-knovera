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

  const currentModel = models.find(m => m.name === selectedModel) || models[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Capsule Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => currentModel && setHoveredModel(currentModel.name)}
        onMouseLeave={() => setHoveredModel(null)}
        className="h-[30px] px-3 rounded-full bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all flex items-center gap-1.5 group"
        title={currentModel ? `${currentModel.displayName} - ${currentModel.purpose}` : 'Select model'}
      >
        <Cpu size={12} className="text-white/60 group-hover:text-white/80" />
        <span className="text-xs font-medium text-white/80 group-hover:text-white">
          {currentModel?.displayName || 'Model'}
        </span>
        <ChevronDown 
          size={12} 
          className={`text-white/60 group-hover:text-white/80 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Tooltip on Hover */}
      {hoveredModel && !isOpen && currentModel && (
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-black border border-white/20 rounded-lg shadow-xl p-3 z-50 pointer-events-none">
          <div className="flex items-start gap-2">
            <Cpu size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-white mb-1">
                {currentModel.displayName}
                <span className="text-white/40 ml-1">:{currentModel.tag}</span>
              </div>
              <div className="text-xs text-white/60 space-y-1">
                <div><span className="text-white/40">Purpose:</span> {currentModel.purpose}</div>
                <div><span className="text-white/40">Size:</span> {currentModel.size}</div>
                <div className="flex items-center gap-1">
                  <span className="text-white/40">API:</span>
                  <span className={currentModel.hasAPI ? 'text-green-400' : 'text-orange-400'}>
                    {currentModel.hasAPI ? 'Available' : 'Limited'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-80 max-h-96 overflow-y-auto bg-black border border-white/20 rounded-lg shadow-xl z-50">
          <div className="sticky top-0 bg-black border-b border-white/10 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu size={14} className="text-white/60" />
                <span className="text-sm font-semibold text-white">AI Models</span>
              </div>
              <span className="text-xs text-white/40">{models.length} available</span>
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
                      console.log('[ModelSelector] onModelChange exists?', !!onModelChange);
                      if (onModelChange) {
                        onModelChange(model.name);
                        console.log('[ModelSelector] Callback executed');
                      } else {
                        console.warn('[ModelSelector] No onModelChange callback!');
                      }
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setHoveredModel(model.name)}
                    onMouseLeave={() => setHoveredModel(null)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      isSelected 
                        ? 'bg-blue-500/20 border border-blue-500/40' 
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-medium ${isSelected ? 'text-blue-300' : 'text-white'}`}>
                            {model.displayName}
                          </span>
                          <span className="text-xs text-white/40">:{model.tag}</span>
                          {isSelected && (
                            <span className="ml-auto px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-white/60 mb-2">{model.purpose}</div>
                        <div className="flex items-center gap-3 text-[11px] text-white/40">
                          <span>📦 {model.size}</span>
                          <span>•</span>
                          <span className={model.hasAPI ? 'text-green-400/80' : 'text-orange-400/80'}>
                            {model.hasAPI ? '✓ API' : '⚠ Limited'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded tooltip on hover */}
                    {hoveredModel === model.name && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-white/40">Family:</span>
                            <span className="text-white/60 ml-1">{model.family}</span>
                          </div>
                          <div>
                            <span className="text-white/40">Params:</span>
                            <span className="text-white/60 ml-1">{model.parameterSize}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-white/40">Modified:</span>
                            <span className="text-white/60 ml-1">{model.modified}</span>
                          </div>
                        </div>
                      </div>
                    )}
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
