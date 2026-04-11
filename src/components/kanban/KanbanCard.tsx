import React from 'react';
import { Clock } from 'lucide-react';

interface KanbanCardProps {
  clientName: string;
  meetingType: string;
  time: string;
  status: string;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ clientName, meetingType, time, status }) => {
  // Border & Accent Color Logic
  // Tosca (#00a1a6) for Approved/Meeting Done
  // Orange (#ff6301) for New Request/Follow-up
  let accentColor = 'bg-gray-400';
  let badgeColor = 'bg-gray-100 text-gray-600';
  let sideBorder = 'border-l-gray-300';

  if (status === 'Approved' || status === 'Meeting Done') {
    accentColor = 'bg-[#00a1a6]'; 
    badgeColor = 'bg-[#00a1a6]/10 text-[#00a1a6]';
    sideBorder = 'border-l-[#00a1a6]';
  } else if (status === 'New Request' || status === 'Follow-up' || status === 'pending') {
    accentColor = 'bg-[#ff6301]'; 
    badgeColor = 'bg-[#ff6301]/10 text-[#ff6301]';
    sideBorder = 'border-l-[#ff6301]';
  }

  // Generate Initials for Avatar
  const initials = clientName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className={`group bg-white p-5 rounded-2xl border border-black/[0.06] ${sideBorder} border-l-4 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 min-w-[280px] cursor-pointer relative overflow-hidden`}>
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-1 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
         <div className={`h-16 w-16 rounded-full -mr-8 -mt-8 ${accentColor}`}></div>
      </div>

      <div className="flex flex-col gap-4 relative z-10">
        {/* Header: Avatar & Client Name */}
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accentColor} text-white text-[13px] font-bold shadow-sm transition-transform duration-500 group-hover:rotate-12`}>
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
             <h4 className="text-[15px] font-bold text-black truncate font-sans leading-tight group-hover:text-primary transition-colors">{clientName}</h4>
             <div className="flex items-center gap-1.5 mt-1.5">
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
                  {meetingType}
                </span>
             </div>
          </div>
        </div>

        {/* Footer: Time & Meta */}
        <div className="flex items-center justify-between border-t border-black/[0.04] pt-4 mt-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-black/40 font-sans tracking-wide">
            <Clock size={14} className="opacity-70 group-hover:text-primary transition-colors" />
            <span>{time} WIB</span>
          </div>
          <div className="flex gap-1">
             <div className="h-1 w-1 rounded-full bg-black/10"></div>
             <div className="h-1 w-1 rounded-full bg-black/10"></div>
             <div className="h-1 w-1 rounded-full bg-black/10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanCard;
