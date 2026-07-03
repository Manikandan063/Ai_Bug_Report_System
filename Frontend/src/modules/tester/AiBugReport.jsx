import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Sparkles, Save, Send, Bot, User, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

const AiBugReport = () => {
  const [projects, setProjects] = useState([]);
  
  // Input Data
  const [projectId, setProjectId] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  
  // Chat State
  const [chatHistory, setChatHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects/my-projects');
        setProjects(res.data.data);
      } catch (err) { console.error(err); }
    };
    fetchProjects();
  }, []);

  // Auto scroll to bottom of chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isGenerating]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!projectId || !moduleName || !bugDescription.trim()) return alert("Please select a project, enter a module name, and describe the bug.");
    
    const userMessage = bugDescription;
    setBugDescription('');
    
    // Add User message to chat
    setChatHistory(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsGenerating(true);
    
    try {
      const res = await api.post('/ai/generate-bug-report', { bugDescription: userMessage });
      const report = res.data.data;
      
      // Add AI response to chat
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        report, 
        tempData: { projectId, moduleName, bugDescription: userMessage },
        saved: false 
      }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { type: 'error', content: 'Failed to generate report: ' + (err.response?.data?.message || err.message) }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitReport = async (chatIndex) => {
    const aiMessage = chatHistory[chatIndex];
    if (!aiMessage || !aiMessage.report || aiMessage.saved) return;
    
    setIsSubmitting(true);
    
    const payload = {
      projectId: Number(aiMessage.tempData.projectId),
      moduleName: aiMessage.tempData.moduleName,
      bugDescription: aiMessage.tempData.bugDescription,
      testDescription: aiMessage.report.testDescription,
      actualResult: aiMessage.report.actualResult,
      expectedResult: aiMessage.report.expectedResult,
      severity: aiMessage.report.severity
    };

    try {
      await api.post('/bug-reports', payload);
      // Mark as saved
      const updatedHistory = [...chatHistory];
      updatedHistory[chatIndex].saved = true;
      setChatHistory(updatedHistory);
    } catch (err) {
      alert('Failed to submit to database: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate(e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] -mx-10 -my-10 bg-[#f9fafb]">
      
      {/* Top Bar Navigation Area */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 p-4 sticky top-0 z-10 shadow-sm flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 tracking-tight">AI Bug Assistant</h2>
            <p className="text-[11px] text-slate-500 font-medium">Powered by Llama 3.3</p>
          </div>
        </div>
        
        {/* Project & Module Selectors (Top right in a chat UI) */}
        <div className="flex items-center gap-3">
          <select 
            className="h-9 rounded-full border border-slate-200 bg-white px-4 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm cursor-pointer"
            value={projectId} 
            onChange={e => setProjectId(e.target.value)}
          >
            <option value="">Select Project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
          </select>
          
          <input 
            type="text"
            className="h-9 w-40 rounded-full border border-slate-200 bg-white px-4 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm placeholder:text-slate-400"
            placeholder="Module (e.g. Cart)"
            value={moduleName}
            onChange={e => setModuleName(e.target.value)}
          />
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 pb-32">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-80 mt-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-800 mb-2">How can I help you test today?</h3>
            <p className="text-slate-500 text-center max-w-md">
              Make sure to select your Project and Module in the top right. Then, just describe the bug naturally below, and I will format it into a professional ticket.
            </p>
          </div>
        ) : (
          chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 max-w-4xl mx-auto ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* AI Avatar */}
              {msg.type !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shrink-0 flex items-center justify-center shadow-sm mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Message Bubble */}
              <div className={`flex flex-col gap-2 max-w-[85%] ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                
                {msg.type === 'user' ? (
                  <div className="bg-slate-800 text-white px-5 py-3.5 rounded-[24px] rounded-br-sm shadow-sm text-[15px] leading-relaxed">
                    {msg.content}
                  </div>
                ) : msg.type === 'error' ? (
                  <div className="bg-red-50 text-red-700 border border-red-100 px-5 py-3.5 rounded-[24px] rounded-tl-sm shadow-sm text-[15px]">
                    {msg.content}
                  </div>
                ) : (
                  // AI Bug Report Output
                  <div className="bg-white border border-slate-200/60 shadow-sm rounded-[24px] rounded-tl-sm p-6 md:p-8 w-full animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center mb-5">
                      <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        Formal Bug Report Generated
                      </h4>
                      <Badge variant={msg.report.severity === 'High' ? 'destructive' : 'secondary'} className="rounded-full px-3">
                        {msg.report.severity} Priority
                      </Badge>
                    </div>
                    
                    <div className="space-y-5 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Test Description</p>
                        <p className="text-slate-700 font-medium">{msg.report.testDescription}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1">Expected Result</p>
                          <p className="text-sm text-slate-700">{msg.report.expectedResult}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1">Actual Result</p>
                          <p className="text-sm text-slate-700">{msg.report.actualResult}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                      {msg.saved ? (
                        <div className="flex items-center text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full font-medium text-sm">
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Saved to Database
                        </div>
                      ) : (
                        <Button 
                          onClick={() => handleSubmitReport(idx)}
                          disabled={isSubmitting}
                          className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 shadow-sm transition-all text-sm font-medium h-10"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isSubmitting ? 'Saving...' : 'Approve & Save Report'}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {msg.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 flex items-center justify-center shadow-sm mt-1">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
              )}
            </div>
          ))
        )}

        {isGenerating && (
          <div className="flex gap-4 max-w-4xl mx-auto justify-start animate-in fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shrink-0 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white animate-spin-slow" />
            </div>
            <div className="bg-white border border-slate-200 px-5 py-4 rounded-[24px] rounded-tl-sm shadow-sm flex items-center gap-2 text-slate-500 text-sm font-medium">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              <span className="ml-2">Analyzing and formatting bug...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Bottom Input Area */}
      <div className="bg-white border-t border-slate-200/60 p-4 sm:p-6 w-full sticky bottom-0 z-20">
        <div className="max-w-4xl mx-auto relative group">
          <textarea 
            className="w-full bg-slate-100 hover:bg-slate-200/50 focus:bg-white border border-transparent focus:border-slate-300 rounded-3xl pl-6 pr-16 py-4 text-[15px] outline-none transition-all resize-none min-h-[60px] max-h-[200px] shadow-sm focus:shadow-md placeholder:text-slate-400"
            placeholder="Describe the bug here... (Press Shift+Enter for new line)"
            rows={1}
            value={bugDescription}
            onChange={(e) => {
              setBugDescription(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
            }}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
          />
          
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !bugDescription.trim()}
            size="icon"
            className="absolute right-3 bottom-3 h-9 w-9 rounded-full bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50 disabled:bg-slate-300 transition-all shadow-sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-3 font-medium">
          AI Bug Assistant can make mistakes. Please verify the generated report before saving.
        </p>
      </div>

    </div>
  );
};

export default AiBugReport;