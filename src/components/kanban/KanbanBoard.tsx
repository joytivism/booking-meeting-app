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
    <div className="w-full mt-12 mb-10 overflow-hidden">
      <div className="mb-6 animate-fadeIn">
        <h2 className="text-xl font-bold text-black font-sans tracking-tight">Workflow Pipeline</h2>
        <p className="text-xs text-black/50 font-semibold font-sans mt-0.5 uppercase tracking-wider italic">Administrative Board View</p>
      </div>

      <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide">
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
    </div>
  );
};

export default KanbanBoard;
