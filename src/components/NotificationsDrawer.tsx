import React, { useState } from 'react';
import { useLeadForge } from '../context/LeadForgeContext';
import {
  X,
  Bell,
  CheckCheck,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export const NotificationsDrawer: React.FC = () => {
  const {
    notificationsDrawerOpen,
    setNotificationsDrawerOpen,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    openOpportunityDetail,
    setOutreachModalOpen,
    setSelectedOpportunityId,
  } = useLeadForge();

  const [filter, setFilter] = useState<'ALL' | 'OPPORTUNITY' | 'SYSTEM'>('ALL');

  if (!notificationsDrawerOpen) return null;

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'ALL') return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md h-full bg-black/95 border-l border-white/[0.1] p-6 flex flex-col justify-between shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-white" />
              <h3 className="font-ui font-semibold text-sm uppercase tracking-wider text-white">
                Notifications & Signals
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.2 rounded-full bg-white text-black text-[10px] font-mono font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={markAllNotificationsRead}
                className="text-[11px] font-ui text-white/50 hover:text-white transition-colors"
                title="Mark all as read"
              >
                Mark all read
              </button>
              <button
                onClick={() => setNotificationsDrawerOpen(false)}
                className="p-1 rounded-full text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5 pb-2 border-b border-white/[0.08]">
            {(['ALL', 'OPPORTUNITY', 'SYSTEM'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1 rounded-full text-xs font-ui transition-all ${
                  filter === t
                    ? 'glass-pill-active text-white font-medium'
                    : 'glass-pill text-white/50 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-1">
          {filteredNotifs.length === 0 ? (
            <div className="text-center py-16 text-xs font-ui text-white/40">
              No notifications in this category.
            </div>
          ) : (
            filteredNotifs.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  markNotificationRead(n.id);
                  if (n.opportunityId) {
                    openOpportunityDetail(n.opportunityId);
                    setNotificationsDrawerOpen(false);
                  }
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                  n.read
                    ? 'bg-white/[0.02] border-white/[0.05] opacity-60'
                    : 'bg-white/[0.05] border-white/[0.15]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono uppercase text-white/50">{n.type}</span>
                  <span className="text-white/40">{n.createdAt}</span>
                </div>

                <div className="text-xs font-ui font-medium text-white">
                  {n.title}
                </div>

                <p className="text-[11px] font-ui text-white/60 leading-relaxed font-light">
                  {n.description}
                </p>

                {n.actionLabel && (
                  <div className="pt-1 text-[11px] font-ui text-white/80 font-medium inline-flex items-center gap-1 hover:underline">
                    <span>{n.actionLabel}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/[0.08] text-center text-xs font-ui text-white/40">
          LeadForge Intelligence Stream V1.0
        </div>
      </div>
    </div>
  );
};
