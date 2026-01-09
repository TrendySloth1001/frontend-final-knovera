'use client';

import { useState } from 'react';
import { studyPlanAPI } from '@/lib/api';
import { Loader2, Brain, Target, ChevronRight, X } from 'lucide-react';

interface StudyPlanFormProps {
  conversationId: string;
  onClose: () => void;
  onComplete: (plan: any) => void;
}

export default function StudyPlanForm({ 
  conversationId, 
  onClose, 
  onComplete 
}: StudyPlanFormProps) {
  const [subject, setSubject] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [jobInfo, setJobInfo] = useState<any>(null);
  const [error, setError] = useState('');
  
  const handleGenerate = async () => {
    if (!subject.trim() || !goal.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setProgress('Initializing AI study plan generator...');
    
    try {
      const response: any = await studyPlanAPI.generate({
        conversationId,
        subject: subject.trim(),
        goal: goal.trim()
      });
      
      if (response.status === 'completed' && response.content) {
        const completeplan = {
          id: response.id,
          subject: subject.trim(),
          goal: goal.trim(),
          content: typeof response.content === 'string' ? JSON.parse(response.content) : response.content
        };
        onComplete(completeplan);
        return;
      }
      
      setProgress('AI is analyzing your learning goals...');
      
      const plan = await pollForCompletion(response.id);
      onComplete(plan);
      
    } catch (error: any) {
      console.error('Study plan generation error:', error);
      setError(error.message || 'Failed to generate study plan');
    } finally {
      setLoading(false);
      setJobInfo(null);
    }
  };
  
  const pollForCompletion = async (planId: string) => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const interval = setInterval(async () => {
        attempts++;
        
        try {
          const jobStatus = await studyPlanAPI.getJobStatus(planId);
          setJobInfo(jobStatus);
          
          const response: any = await studyPlanAPI.getStatus(planId);
          
          if (response.status === 'completed') {
            clearInterval(interval);
            setProgress('Study plan generated successfully!');
            resolve({ 
              id: planId, 
              subject: subject.trim(),
              goal: goal.trim(),
              content: typeof response.content === 'string' ? JSON.parse(response.content) : response.content 
            });
          } else if (response.status === 'failed') {
            clearInterval(interval);
            reject(new Error(response.error || 'Generation failed'));
          } else {
            const elapsed = attempts * 2;
            const jobState = jobStatus?.state || 'queued';
            const stateText = jobState === 'active' ? 'Processing' : 'Queued';
            setProgress(`${stateText} - Generating personalized learning path... (${elapsed}s)`);
          }
          
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      }, 2000);
    });
  };
  
  return (
    <div className="mb-3 md:mb-4 bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/30 rounded-lg md:rounded-2xl p-3 md:p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
          <Target className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
          Create Study Plan
        </h3>
        <button
          onClick={onClose}
          disabled={loading}
          className="text-white/50 hover:text-white/80 transition-colors"
        >
          <X className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
      
      <div className="space-y-2.5 md:space-y-3">
        <div>
          <label className="block text-xs text-white/60 mb-1">
            What do you want to learn?
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., React, Python, Machine Learning"
            className="w-full bg-black/50 border border-white/20 rounded px-2.5 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-xs text-white/60 mb-1">
            Your learning goal
          </label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., Build production apps, Career switch"
            className="w-full bg-black/50 border border-white/20 rounded px-2.5 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
            disabled={loading}
          />
        </div>
        
        {loading && (
          <div className="bg-black/50 border border-purple-500/30 rounded p-2.5 md:p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Brain className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span className="text-xs font-medium text-purple-300">AI Generating</span>
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin ml-auto" />
            </div>
            <p className="text-xs text-purple-200/70 mb-1.5">{progress}</p>
            {jobInfo && (
              <div className="flex items-center gap-2 text-xs text-purple-300/60">
                <ChevronRight className="w-3 h-3" />
                <span>State: {jobInfo.state || 'queued'}</span>
                {jobInfo.attemptsMade > 0 && (
                  <span>• Attempt: {jobInfo.attemptsMade}</span>
                )}
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded p-2.5">
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}
        
        <button
          onClick={handleGenerate}
          disabled={!subject.trim() || !goal.trim() || loading}
          className="w-full px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm rounded hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Generating...' : 'Generate Study Plan'}
        </button>
      </div>
    </div>
  );
}
