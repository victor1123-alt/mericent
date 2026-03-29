import React, { useState, useEffect, useRef } from 'react';
import { FiMenu, FiChevronLeft, FiChevronRight, FiMove } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'admin_sidebar_state_v1';

const defaultState = { collapsed: false, width: 260, side: 'left' } as const;

type SidebarState = typeof defaultState;

const AdminSidebar: React.FC = () => {
  const [state, setState] = useState<SidebarState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
    } catch (err) {
      return defaultState;
    }
  });

  const ref = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const clientX = e.clientX;
      const container = ref.current?.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();

      let newWidth = state.side === 'left' ? clientX - rect.left : rect.right - clientX;
      newWidth = Math.max(160, Math.min(newWidth, 520));
      setState((s) => ({ ...s, width: newWidth }));
    };

    const onUp = () => { dragging.current = false; document.body.style.cursor = ''; };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [state.side]);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = 'ew-resize';
  };

  const toggleCollapse = () => setState((s) => ({ ...s, collapsed: !s.collapsed }));
  const toggleSide = () => setState((s) => ({ ...s, side: s.side === 'left' ? 'right' : 'left' }));

  const navItems = [
    { label: 'Dashboard', to: '/admin' },
    { label: 'Products', to: '/admin/products' },
    { label: 'Orders', to: '/admin/orders' },
    { label: 'Shipping', to: '/admin/shipping' },
  ];

  const sidebarStyle: React.CSSProperties = {
    width: state.collapsed ? 72 : state.width,
    transition: 'width 180ms ease',
    order: state.side === 'left' ? 0 : 1,
  };

  const handleStyle: React.CSSProperties = {
    width: 8,
    cursor: 'ew-resize',
    background: 'transparent',
  };

  return (
    <div ref={ref} className={`flex-shrink-0 bg-white dark:bg-gray-800 border-r dark:border-gray-700 h-[calc(100vh-64px)] sticky top-16 z-30 self-start`} style={sidebarStyle}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-3 py-3 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <button onClick={toggleCollapse} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <FiMenu />
            </button>
            {!state.collapsed && <div className="font-semibold text-lg">Admin</div>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleSide} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Move sidebar">
              <FiMove />
            </button>
            <button onClick={toggleCollapse} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Collapse">
              {state.collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-auto p-3">
          <ul className="space-y-2">
            {navItems.map((it) => (
              <li key={it.to}>
                <Link to={it.to} className={`flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${state.collapsed ? 'justify-center' : ''}`}>
                  <span className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center text-primary">{it.label[0]}</span>
                  {!state.collapsed && <span className="font-medium">{it.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-2 py-3 border-t dark:border-gray-700 flex items-center justify-center">
          {!state.collapsed && <div className="text-xs text-gray-500">Quick Actions</div>}
        </div>
      </div>

      {/* Drag handle - positioned on the outer edge depending on side */}
      <div
        onMouseDown={startDrag}
        style={{
          position: 'absolute',
          top: 64,
          height: 'calc(100vh - 64px)',
          width: 8,
          cursor: 'ew-resize',
          left: state.side === 'left' ? (state.collapsed ? 72 - 4 : (state.width - 4)) : undefined,
          right: state.side === 'right' ? (state.collapsed ? 72 - 4 : (state.width - 4)) : undefined,
          zIndex: 40,
        }}
        aria-hidden
      />
    </div>
  );
};

export default AdminSidebar;
