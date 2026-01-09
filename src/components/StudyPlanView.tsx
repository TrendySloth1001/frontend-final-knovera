'use client';

import { useState } from 'react';
import { 
  BookOpen, 
  Target, 
  Clock, 
  Users, 
  ChevronDown, 
  CheckCircle2,
  Lightbulb,
  Code,
  FileText,
  Rocket
} from 'lucide-react';

interface StudyPlanViewProps {
  plan: {
    id: string;
    subject: string;
    goal: string;
    content: any;
  };
}

export default function StudyPlanView({ plan }: StudyPlanViewProps) {
  const { content, subject } = plan;
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([0]));
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  
  // Safety check for content
  if (!content || typeof content !== 'object') {
    console.error('[StudyPlanView] Invalid content:', content);
    return (
      <div className="mb-3 md:mb-4 bg-black p-4 rounded-lg border border-red-500/30">
        <p className="text-red-400">Error: Study plan content is not available</p>
      </div>
    );
  }
  
  const togglePhase = (index: number) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedPhases(newExpanded);
  };
  
  const toggleModule = (key: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedModules(newExpanded);
  };
  
  return (
    <div className="mb-3 md:mb-4 bg-black max-w-full">
      {/* Header */}
      <div className="px-3 py-2 md:px-4 md:py-3 border-b border-white/10">
        <div className="flex items-start gap-2 md:gap-3">
          <div className="p-1.5 md:p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex-shrink-0">
            <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-bold mb-1 md:mb-2 text-white">
              {subject} Study Plan
            </h3>
            <p className="text-xs md:text-sm text-white/70 mb-2 md:mb-3">{content.overview}</p>
            <div className="flex flex-wrap gap-1.5 md:gap-2 text-xs">
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 px-2 py-1 rounded flex items-center gap-1.5 text-white">
                <Clock className="w-3 h-3" />
                {content.estimatedWeeks} weeks
              </span>
              <span className="bg-gradient-to-r from-purple-500 to-purple-600 px-2 py-1 rounded capitalize flex items-center gap-1.5 text-white">
                <Users className="w-3 h-3" />
                {content.targetAudience}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Phases */}
      <div className="px-3 py-2 md:px-4 md:py-3">
        {content.phases?.map((phase: any, phaseIndex: number) => {
          const isExpanded = expandedPhases.has(phaseIndex);
          
          return (
            <div key={phaseIndex} className="relative">
              {/* Vertical connector line to next phase */}
              {phaseIndex > 0 && (
                <div className="absolute left-4 md:left-5 -top-0 w-[2px] h-4 bg-yellow-500/60"></div>
              )}
              
              {/* Phase Container */}
              <div className="flex gap-2 md:gap-3">
                {/* Left side - Vertical line and node */}
                <div className="flex flex-col items-center flex-shrink-0 relative">
                  {/* Vertical guide line */}
                  {phaseIndex < content.phases.length - 1 && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-10 md:top-12 bottom-0 w-[2px] bg-yellow-500/60 z-0"></div>
                  )}
                  
                  {/* Node */}
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-yellow-400 border-2 border-yellow-500 shadow-md shadow-yellow-500/40 flex items-center justify-center relative z-10">
                    <Target className="w-5 h-5 md:w-6 md:h-6 text-black" />
                  </div>
                </div>
                
                {/* Right side - Content */}
                <div className="flex-1 pb-4 md:pb-6 min-w-0">
                  <button
                    onClick={() => togglePhase(phaseIndex)}
                    className="w-full text-left group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm md:text-base mb-1 text-white group-hover:text-blue-400 transition-colors">
                          Phase {phaseIndex + 1}: {phase.name}
                        </h4>
                        <p className="text-xs md:text-sm text-white/70 mb-1.5">{phase.description}</p>
                        <span className="text-xs text-white/50 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {phase.duration}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 md:w-5 md:h-5 text-white/50 transition-transform flex-shrink-0 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>
                  
                  {/* Modules */}
                  {isExpanded && (
                    <div className="mt-3 md:mt-4 space-y-3 md:space-y-4 relative">
                      {/* Vertical line for modules */}
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-yellow-500/40"></div>
                      
                      {phase.modules?.map((module: any, moduleIndex: number) => {
                        const moduleKey = `${phaseIndex}-${moduleIndex}`;
                        const isModuleExpanded = expandedModules.has(moduleKey);
                        
                        return (
                          <div key={moduleIndex} className="relative flex gap-2 md:gap-3">
                            {/* Module connector */}
                            <div className="flex items-start pt-1.5 flex-shrink-0">
                              {/* Horizontal line from vertical guide */}
                              <div className="w-3 md:w-4 h-[2px] bg-yellow-500/50 mt-2"></div>
                              {/* Module node */}
                              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-yellow-300 border border-yellow-400 rounded-full"></div>
                            </div>
                            
                            {/* Module content */}
                            <div className="flex-1 min-w-0">
                              <button
                                onClick={() => toggleModule(moduleKey)}
                                className="w-full text-left group"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-semibold text-xs md:text-sm text-white group-hover:text-purple-400 transition-colors">
                                      {module.title}
                                    </h5>
                                    <p className="text-xs text-white/60 mt-1">{module.description}</p>
                                    {module.estimatedHours && (
                                      <span className="text-xs text-white/50 mt-1.5 inline-flex items-center gap-1.5">
                                        <Clock className="w-3 h-3" />
                                        {module.estimatedHours} hours
                                      </span>
                                    )}
                                  </div>
                                  <ChevronDown
                                    className={`w-3.5 h-3.5 md:w-4 md:h-4 text-white/50 transition-transform flex-shrink-0 mt-1 ${
                                      isModuleExpanded ? 'rotate-180' : ''
                                    }`}
                                  />
                                </div>
                              </button>
                              
                              {isModuleExpanded && (
                                <div className="mt-2.5 md:mt-3 space-y-2.5 md:space-y-3">
                                  {/* Topics */}
                                  <div>
                                    <p className="text-xs text-white/50 mb-1.5 flex items-center gap-1.5">
                                      <Lightbulb className="w-3 h-3" />
                                      TOPICS
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {module.topics?.map((topic: string, topicIndex: number) => (
                                        <span
                                          key={topicIndex}
                                          className="text-xs text-white px-2 py-1 border border-white/20 rounded"
                                        >
                                          {topic}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* Practice Project */}
                                  {module.practiceProject && (
                                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 p-2.5 md:p-3 rounded">
                                      <p className="text-xs text-purple-300 mb-1.5 font-semibold flex items-center gap-1.5">
                                        <Rocket className="w-3 h-3" />
                                        PRACTICE PROJECT
                                      </p>
                                      <p className="text-xs text-white/70">{module.practiceProject}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {content.milestones && content.milestones.length > 0 && (
        <>
          <div className="h-px bg-white/10 mx-3 md:mx-4"></div>
          
          {/* Milestones Timeline */}
          <div className="px-3 py-3 md:px-4 md:py-4">
            <h5 className="text-xs md:text-sm font-semibold text-white/50 mb-4 md:mb-6 flex items-center gap-2">
              <Target className="w-4 h-4" />
              MILESTONES TIMELINE
            </h5>
            <div className="relative py-2">
              {/* Horizontal progress line - positioned precisely */}
              <div className="absolute left-[calc(0.375rem)] right-[calc(0.375rem)] md:left-[calc(0.4375rem)] md:right-[calc(0.4375rem)] top-[1.375rem] h-[2px] bg-gradient-to-r from-yellow-500/60 via-yellow-400/60 to-yellow-500/60"></div>
              
              {/* Timeline items */}
              <div className="relative flex items-start">
                {content.milestones.map((milestone: any, index: number) => {
                  const isFirst = index === 0;
                  const isLast = index === content.milestones.length - 1;
                  
                  return (
                    <div 
                      key={index} 
                      className={`flex flex-col items-center ${!isFirst && !isLast ? 'flex-1' : ''}`}
                      style={{ 
                        flex: isFirst || isLast ? '0 0 auto' : '1',
                        minWidth: isFirst || isLast ? '0' : '100px'
                      }}
                    >
                      {/* Vertical connector to node */}
                      <div className="w-[2px] h-3 md:h-4 bg-gradient-to-b from-transparent to-yellow-500/50"></div>
                      
                      {/* Node with pulse effect */}
                      <div className="relative w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0">
                        <div className="absolute inset-0 rounded-full bg-yellow-400 border-2 border-yellow-500 shadow-lg shadow-yellow-400/40 z-10"></div>
                        <div className="absolute inset-0 rounded-full bg-yellow-300 animate-ping opacity-25"></div>
                        <div className="absolute inset-[-2px] rounded-full bg-yellow-400/20 blur-sm"></div>
                      </div>
                      
                      {/* Vertical connector to badge */}
                      <div className="w-[2px] h-2 md:h-3 bg-gradient-to-b from-yellow-500/50 to-transparent"></div>
                      
                      {/* Week badge with enhanced styling */}
                      <div className="mt-1 bg-gradient-to-r from-blue-500 to-purple-600 px-2.5 py-0.5 md:px-3 md:py-1 rounded-md text-[10px] md:text-xs font-bold text-white whitespace-nowrap shadow-lg">
                        WEEK {milestone.week}
                      </div>
                      
                      {/* Achievement text with better width constraints */}
                      <p className="text-[10px] md:text-xs text-white/70 text-center mt-2 px-1 leading-snug max-w-[90px] md:max-w-[140px] break-words">
                        {milestone.achievement}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
      
      {content.resources && (
        <>
          <div className="h-px bg-white/10 mx-3 md:mx-4"></div>
          
          {/* Resources */}
          <div className="px-3 py-2 md:px-4 md:py-3">
            <h5 className="text-xs md:text-sm font-semibold text-white/50 mb-2 md:mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              RESOURCES
            </h5>
            <div className="space-y-2 text-xs md:text-sm">
              {content.resources.documentation && (
                <div>
                  <span className="text-white/50">Documentation: </span>
                  <span className="text-white/70">{content.resources.documentation.join(', ')}</span>
                </div>
              )}
              {content.resources.practice && (
                <div>
                  <span className="text-white/50">Practice: </span>
                  <span className="text-white/70">{content.resources.practice.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
