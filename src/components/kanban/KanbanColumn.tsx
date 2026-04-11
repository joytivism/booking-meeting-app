import React, { ReactNode } from 'react';

interface KanbanColumnProps {
  title: string;
  children: ReactNode;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, children }) => {
  return (
    <div className="flex flex-col gap-4 min-w-[300px] flex-shrink-0 animate-fadeIn">
      {/* Header Kolom */}
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-sm font-bold text-black/70 font-sans uppercase tracking-widest">{title}</h3>
        <div className="h-6 w-6 rounded-lg bg-black/5 flex items-center justify-center text-[10px] font-bold text-black/40">
           {React.Children.count(children)}
        </div>
      </div>
      
      {/* List Card Container */}
      <div className="flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
};

export default KanbanColumn;
