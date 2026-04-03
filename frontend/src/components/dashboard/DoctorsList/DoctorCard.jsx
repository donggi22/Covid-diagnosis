import React from 'react';
import { User, MoreVertical } from 'react-feather';

const DoctorCard = ({ name, role }) => (
  <li className="grid grid-cols-[48px_1fr_auto] items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all cursor-pointer group border border-transparent hover:border-slate-100">
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-105 transition-transform duration-300">
      <User size={24} strokeWidth={2.5} />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-bold text-slate-800 truncate leading-tight">{name}</p>
      <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5">{role}</p>
    </div>
    <button className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all opacity-0 group-hover:opacity-100">
      <MoreVertical size={16} />
    </button>
  </li>
);

export default DoctorCard;



