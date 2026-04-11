import React from 'react';
import { Clock } from 'lucide-react';

interface KanbanCardProps {
  clientName: string;
  meetingType: string;
  time: string;
  status: string;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ clientName, meetingType, time, status }) => {
  // Border color logic:
  // Tosca (#00a1a6) for Approved/Meeting Done
  // Orange (#ff6301) for New Request/Follow-up
  let borderColor = 'border-l-gray-200';
  if (status === 'Approved' || status === 'Meeting Done') {
    borderColor = 'border-l-[#00a1a6]'; 
  } else if (status === 'New Request' || status === 'Follow-up' || status === 'pending') {
    borderColor = 'border-l-[#ff6301]'; 
  }

  return (
    <div className={`bg-white p-4 rounded-xl border border-black/10 ${borderColor} border-l-4 shadow-sm hover:shadow-md transition-shadow min-w-[280px]`}>
      <div className="flex flex-col">
        <h4 className="text-sm font-bold text-black mb-1 font-sans">{clientName}</h4>
        <p className="text-xs text-black/60 font-medium mb-3 font-sans">{meetingType}</p>
        
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-black/40 uppercase tracking-wider font-sans">
          <Clock size={12} />
          {time} WIB
        </div>
      </div>
    </div>
  );
};

export default KanbanCard;
