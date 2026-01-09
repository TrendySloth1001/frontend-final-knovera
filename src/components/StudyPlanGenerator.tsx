'use client';

import { useState } from 'react';
import { studyPlanAPI } from '@/lib/api';
import { Loader2, Brain, Target, ChevronRight } from 'lucide-react';

interface StudyPlanGeneratorProps {
  conversationId: string;
  onClose: () => void;
  onComplete: (plan: any) => void;
}

export default function StudyPlanGenerator({ 
  conversationId, 
  onClose, 
  onComplete 
}: StudyPlanGeneratorProps) {
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
      // Start generation
      const response: any = await studyPlanAPI.generate({
        conversationId,
        subject: subject.trim(),
        goal: goal.trim()
      });
      
      if (response.status === 'completed' && response.content) {
        // Already exists and completed
        onComplete({ id: response.id, content: response.content });
        return;
      }
      
      setProgress('AI is analyzing your learning goals...');
      
      // Poll for completion with job status
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
  
  // Poll until complete with job status (no frontend timeout)
  const pollForCompletion = async (planId: string) => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const interval = setInterval(async () => {
        attempts++;
        
        try {
          // Get job status first
          const jobStatus = await studyPlanAPI.getJobStatus(planId);
          setJobInfo(jobStatus);
          
          // Then check plan status
          const response: any = await studyPlanAPI.getStatus(planId);
          
          if (response.status === 'completed') {
            clearInterval(interval);
            setProgress('Study plan generated successfully!');
            resolve({ id: planId, content: response.content });
          } else if (response.status === 'failed') {
            clearInterval(interval);
            reject(new Error(response.error || 'Generation failed'));
          } else {
            // Update progress with time and job state
            const elapsed = attempts * 2;
            const jobState = jobStatus?.state || 'queued';
            const stateText = jobState === 'active' ? 'Processing' : 'Queued';
            setProgress(`${stateText} - Generating personalized learning path... (${elapsed}s)`);
          }
          
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      }, 2000); // Poll every 2 seconds
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-black border-2 border-white/20 rounded-lg md:rounded-2xl p-4 md:p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Create Study Plan
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white/50 hover:text-white/80 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-3 md:space-y-4">
          <div>
            <label className="block text-xs md:text-sm font-medium mb-1.5 text-white/70">
              What do you want to learn?
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., React, Python, Machine Learning, Spanish"
              className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 text-sm md:text-base"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-xs md:text-sm font-medium mb-1.5 text-white/70">
              Your learning goal
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Build production apps, Career switch, Pass certification"
              className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 text-sm md:text-base"
              disabled={loading}
            />
          </div>
          
          {loading && (
            <div className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/30 rounded-lg p-3 md:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 md:w-5 md:h-5 text-purple-400 flex-shrink-0" />
                <span className="text-xs md:text-sm font-medium text-purple-300">AI Generating</span>
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin ml-auto" />
              </div>
              <p className="text-xs md:text-sm text-purple-200/70 mb-2">{progress}</p>
              {jobInfo && (
                <div className="flex items-center gap-2 text-xs text-purple-300/60">
                  <ChevronRight className="w-3 h-3" />
                  <span>Job State: {jobInfo.state || 'queued'}</span>
                  {jobInfo.attemptsMade > 0 && (
                    <span>• Attempt: {jobInfo.attemptsMade}</span>
                  )}
                </div>
              )}
            </div>
          )}
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-xs md:text-sm text-red-300">{error}</p>
            </div>
          )}
          
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-3 md:px-4 py-2 text-white/70 hover:bg-white/10 rounded-lg disabled:opacity-50 text-sm md:text-base border border-white/20"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={!subject.trim() || !goal.trim() || loading}
              className="px-3 md:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {loading ? 'Generating...' : 'Generate Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
