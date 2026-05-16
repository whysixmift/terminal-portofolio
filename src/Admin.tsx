import React from 'react';
import { LayoutDashboard, FileText, Image as ImageIcon, Settings, LogOut } from 'lucide-react';

export default function Admin() {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-100 rounded-md flex items-center justify-center">
             <span className="text-zinc-950 font-bold text-xs">JFY</span>
          </div>
          <span className="font-semibold tracking-tight">Admin Console</span>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active />
          <NavItem icon={<FileText size={18} />} label="Blogs" />
          <NavItem icon={<ImageIcon size={18} />} label="Media" />
          <NavItem icon={<Settings size={18} />} label="Settings" />
        </nav>

        <div className="mt-auto">
           <NavItem icon={<LogOut size={18} />} label="Logout" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back, Julian</h1>
            <p className="text-zinc-500 text-sm">Manage your engineering blog and portfolio.</p>
          </div>
          <button className="bg-zinc-100 text-zinc-950 px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors">
            New Project
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatsCard label="Total Blogs" value="4" delta="+1 this month" />
          <StatsCard label="Photos" value="12" delta="+4 new uploads" />
          <StatsCard label="Terminal Hits" value="1,240" delta="+15% vs last week" />
        </div>

        <section>
          <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
             <p className="text-sm text-zinc-400">Your Hack Club Nest deployment is active. PM2 is monitoring 'jfy-sh'.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}>
      {icon}
      {label}
    </button>
  );
}

function StatsCard({ label, value, delta }: { label: string, value: string, delta: string }) {
  return (
    <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-xs text-zinc-600">{delta}</p>
    </div>
  );
}
