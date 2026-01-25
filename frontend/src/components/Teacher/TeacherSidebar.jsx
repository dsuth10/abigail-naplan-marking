import { useNavigate, useLocation } from 'react-router-dom';

const TeacherSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/teacher/projects', fill: true },
    { icon: 'group', label: 'My Classes', path: '/teacher/roster', fill: false },
    { icon: 'folder_open', label: 'Projects', path: '/teacher/projects', fill: false },
    { icon: 'visibility', label: 'Monitoring', path: '#', fill: false },
    { icon: 'bar_chart', label: 'Results', path: '#', fill: false },
  ];

  const isActive = (path) => {
    if (path === '/teacher/projects') {
      return location.pathname === '/teacher/projects' || location.pathname.startsWith('/teacher/dashboard');
    }
    return location.pathname === path;
  };

  return (
    <aside className="hidden lg:flex w-80 flex-col justify-between bg-white border-r border-border p-6 h-full shrink-0 shadow-xl shadow-slate-200/50 z-20">
      <div className="flex flex-col gap-10">
        {/* Brand */}
        <div className="flex items-center gap-4 px-2">
          <div className="bg-primary/10 flex items-center justify-center rounded-2xl size-12 shadow-sm border border-primary/5">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>school</span>
          </div>
          <h1 className="text-2xl font-display font-black tracking-tight text-slate-900">WriteSmart</h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.label}
                onClick={() => item.path !== '#' && navigate(item.path)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${active
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900 active:scale-95'
                  }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '24px', fontVariationSettings: item.fill ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span className={`text-base font-bold tracking-tight ${active ? 'text-white' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>

      </div>

      {/* User Profile Bottom */}
      <div className="flex items-center gap-4 px-4 py-4 mt-auto rounded-3xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-all group">
        <div className="relative">
          <div className="bg-primary/10 rounded-2xl size-12 flex items-center justify-center text-primary font-bold text-lg border-2 border-white shadow-sm group-hover:scale-105 transition-transform">T</div>
          <div className="absolute -bottom-1 -right-1 size-4 bg-success rounded-full border-2 border-white"></div>
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-slate-900 text-sm font-bold truncate">Staff Member</p>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest truncate">Teacher</p>
        </div>
        <span className="material-symbols-outlined ml-auto text-slate-300 group-hover:text-slate-500 transition-colors" style={{ fontSize: '20px' }}>settings</span>
      </div>
    </aside>
  );
};

export default TeacherSidebar;
