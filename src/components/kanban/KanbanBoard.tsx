import React from 'react';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';

const MOCK_DATA = [
  { id: '1', client: 'Budi Santoso', type: 'Consultation Session', time: '10:00', status: 'New Request' },
  { id: '2', client: 'Siti Aminah', type: 'Weekly Meeting', time: '13:00', status: 'Approved' },
  { id: '3', client: 'John Doe Corp', type: 'Onboarding Project', time: '15:30', status: 'Meeting Done' },
  { id: '4', client: 'Real Estate Ltd', type: 'Evaluasi Campaign', time: '09:00', status: 'Follow-up' },
  { id: '5', client: 'Warung Tech', type: 'Monthly Review', time: '11:00', status: 'New Request' },
];

const KanbanBoard: React.FC = () => {
  const columns = ["New Request", "Approved", "Meeting Done", "Follow-up"];

  return (
    <div className="w-full mt-16 mb-12 p-10 rounded-[40px] bg-gray-50/20 border border-black/[0.02] shadow-[inset_0_2px_10px_rgba(0,0,0,0.01)] overflow-hidden">
      {/* Header Pipeline Premium */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 animate-fadeIn px-4 gap-4">
        <div className="flex flex-col gap-2">
           <h2 className="text-2xl font-black text-black font-sans tracking-tighter">Workflow Pipeline</h2>
           <div className="flex items-center gap-3">
             <span className="h-1 w-8 bg-primary rounded-full"></span>
             <p className="text-[10px] text-black/40 font-black font-sans uppercase tracking-[0.25em] leading-none">Administrative Pipeline Board</p>
           </div>
        </div>
        <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-black/[0.04] shadow-sm self-start sm:self-auto">
           <div className="h-2 w-2 rounded-full bg-secondary animate-pulse"></div>
           <span className="text-[10px] font-black text-black/50 uppercase tracking-widest whitespace-nowrap leading-none">Live Sync: Active</span>
        </div>
      </div>

      <div className="flex gap-10 overflow-x-auto pb-12 scrollbar-hide px-4">
        {columns.map((title) => (
          <KanbanColumn key={title} title={title}>
            {MOCK_DATA.filter(item => item.status === title).map(item => (
              <KanbanCard 
                key={item.id}
                clientName={item.client}
                meetingType={item.type}
                time={item.time}
                status={item.status}
              />
            ))}
          </KanbanColumn>
        ))}
      </div>

      {/* Footer hint */}
      <div className="mt-2 flex justify-center opacity-30">
        <div className="h-1 w-24 bg-black/10 rounded-full"></div>
      </div>
    </div>
  );
};

export default KanbanBoard;
