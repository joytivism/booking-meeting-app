import React, { ReactNode } from 'react';

interface KanbanColumnProps {
  title: string;
  children: ReactNode;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, children }) => {
  return (
    <div className="flex flex-col gap-6 min-w-[320px] flex-shrink-0 animate-fadeIn">
      {/* Header Kolom Premium Area */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50/50 backdrop-blur-sm rounded-2xl border border-black/[0.04] mb-1">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-black/20"></div>
          <h3 className="text-[11px] font-bold text-black/50 font-sans uppercase tracking-[0.15em] leading-none mb-[-1px]">{title}</h3>
        </div>
        <span className="flex h-5 min-w-[30px] px-2 items-center justify-center rounded-full bg-black/5 text-[10px] font-bold text-black/40">
           {React.Children.count(children)}
        </span>
      </div>
      
      {/* List Card Container with enhanced spacing */}
      <div className="flex flex-col gap-5 px-0.5">
        {children}
      </div>
    </div>
  );
};

export default KanbanColumn;
