import React, { useState } from 'react';
import { useLeadForge } from '../context/LeadForgeContext';
import { Task } from '../types';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Plus,
  ArrowUpRight,
  RotateCw,
} from 'lucide-react';

export const TasksView: React.FC = () => {
  const { tasks, completeTask, snoozeTask, addTask, openOpportunityDetail } = useLeadForge();
  const [filter, setFilter] = useState<'all' | 'due' | 'completed'>('due');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAccount, setNewAccount] = useState('');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'due') return t.status === 'DUE' || t.status === 'OVERDUE';
    if (filter === 'completed') return t.status === 'COMPLETED';
    return true;
  });

  const dueCount = tasks.filter((t) => t.status === 'DUE' || t.status === 'OVERDUE').length;

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2 text-white/50 text-xs font-ui tracking-widest uppercase">
            <Clock className="w-3.5 h-3.5" />
            <span>Follow-Up Engine & Cadences</span>
          </div>
          <h1 className="font-editorial italic text-3xl sm:text-4xl text-white">
            Scheduled Tasks & Follow-ups
          </h1>
          <p className="text-sm font-ui text-white/60 font-light mt-1">
            Ensure no qualified lead slips through the cracks. Timed reminders triggered by stage changes and automated cadences.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-full bg-white text-black hover:bg-white/90 text-xs font-ui font-semibold flex items-center gap-1.5 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('due')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-ui transition-all ${
              filter === 'due' ? 'glass-pill-active text-white font-medium' : 'glass-pill text-white/60 hover:text-white'
            }`}
          >
            Due & Overdue ({dueCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-ui transition-all ${
              filter === 'completed' ? 'glass-pill-active text-white font-medium' : 'glass-pill text-white/60 hover:text-white'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-ui transition-all ${
              filter === 'all' ? 'glass-pill-active text-white font-medium' : 'glass-pill text-white/60 hover:text-white'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl glass-panel p-12 text-center text-white/40 text-sm font-ui">
            No tasks in this view.
          </div>
        ) : (
          filteredTasks.map((t) => {
            const isCompleted = t.status === 'COMPLETED';

            return (
              <div
                key={t.id}
                className={`p-5 rounded-2xl glass-panel border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted ? 'opacity-50 border-white/[0.04]' : 'border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => completeTask(t.id)}
                    disabled={isCompleted}
                    className={`mt-0.5 p-1 rounded-full transition-colors ${
                      isCompleted ? 'text-emerald-500' : 'text-white/30 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>

                  <div className="space-y-1">
                    <div
                      className={`text-sm font-ui font-medium ${
                        isCompleted ? 'line-through text-white/50' : 'text-white'
                      }`}
                    >
                      {t.title}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-ui text-white/50 flex-wrap">
                      <span
                        onClick={() => openOpportunityDetail(t.opportunityId)}
                        className="text-white/80 hover:underline cursor-pointer font-medium"
                      >
                        {t.accountName}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">{t.dueAt}</span>
                      <span>•</span>
                      <span className="text-white/40">{t.reason}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {!isCompleted && (
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => snoozeTask(t.id)}
                      className="px-3 py-1 rounded-full glass-pill hover:bg-white/10 text-xs font-ui text-white/60 hover:text-white transition-all"
                    >
                      Snooze 1d
                    </button>
                    <button
                      onClick={() => openOpportunityDetail(t.opportunityId)}
                      className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-ui text-white flex items-center gap-1 transition-all"
                    >
                      <span>Open Dossier</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl glass-panel-elevated border border-white/20 space-y-4">
            <h3 className="font-editorial italic text-2xl text-white">Create Custom Task</h3>
            <div>
              <label className="text-xs font-ui text-white/60 block mb-1">Task Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Call VP of Engineering to discuss proposal"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-ui text-white placeholder-white/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-ui text-white/60 block mb-1">Account Name</label>
              <input
                type="text"
                value={newAccount}
                onChange={(e) => setNewAccount(e.target.value)}
                placeholder="e.g. Acme SaaS"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-ui text-white placeholder-white/30 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-full text-xs font-ui text-white/50 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newTitle.trim()) return;
                  addTask({
                    opportunityId: 'opp-01',
                    accountName: newAccount.trim() || 'General Pursuit',
                    title: newTitle.trim(),
                    dueAt: 'Tomorrow, 10:00 AM',
                    status: 'DUE',
                    reason: 'Manually added custom action item',
                    assignee: 'Alex (You)',
                  });
                  setNewTitle('');
                  setNewAccount('');
                  setShowAddModal(false);
                }}
                className="px-4 py-1.5 rounded-full bg-white text-black font-semibold text-xs font-ui"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
