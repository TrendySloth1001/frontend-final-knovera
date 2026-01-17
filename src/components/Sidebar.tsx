'use client';

import { useState } from 'react';
import {
    LayoutDashboard,
    BarChart3,
    Settings,
    Users,
    Bell,
    MessageSquare,
    Brain,
    ChevronRight,
    ChevronLeft,
    User,
    LogOut,
    Compass
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
    activeTab: string;
    changeTab: (tab: string) => void;
    unreadCount: number;
    showMobileMenu: boolean;
    setShowMobileMenu: (show: boolean) => void;
    user: any;
    isCollapsed: boolean;
    toggleCollapse: () => void;
    onLogout: () => void;
}

const NavItem = ({ icon: Icon, label, active, onClick, isCollapsed, badge }: any) => (
    <button
        onClick={onClick}
        title={isCollapsed ? label : undefined}
        className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-4 px-3'} py-3 rounded-lg cursor-pointer transition-all duration-200 w-full group relative ${active
            ? 'text-white bg-neutral-800'
            : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'
            }`}
    >
        <div className="relative">
            <Icon size={20} className="shrink-0" />
            {/* Badge for collapsed mode often sits on the icon, but let's keep it simple for now or overlay */}
            {isCollapsed && badge > 0 && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white border border-black">
                    {badge > 9 ? '9+' : badge}
                </div>
            )}
        </div>

        {!isCollapsed && (
            <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {label}
            </span>
        )}

        {/* Expanded mode badge */}
        {!isCollapsed && badge > 0 && (
            <div className="ml-auto w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                {badge > 9 ? '9+' : badge}
            </div>
        )}

        {/* Tooltip for collapsed mode */}
        {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                {label}
            </div>
        )}
    </button>
);

export default function Sidebar({
    activeTab,
    changeTab,
    unreadCount,
    showMobileMenu,
    setShowMobileMenu,
    user,
    isCollapsed,
    toggleCollapse,
    onLogout
}: SidebarProps) {
    const router = useRouter();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleNavClick = (tab: string) => {
        changeTab(tab);
        setShowMobileMenu(false);
    };

    return (
        <>
            {/* Mobile Menu Overlay */}
            {showMobileMenu && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setShowMobileMenu(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-50 
          ${isCollapsed ? 'w-20' : 'w-64'} 
          border-r border-neutral-800 
          flex flex-col 
          bg-[#000000] 
          transition-all duration-300 ease-in-out
          ${showMobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:transform-none'}
        `}
            >
                {/* Header / Logo */}
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} h-16 mb-4`}>
                    <div className="flex items-center space-x-2 overflow-hidden">
                        <img
                            src="/AppLogo/App-logo.png"
                            alt="Knovera"
                            className={`object-contain transition-all duration-300 ${isCollapsed ? 'w-10 h-10' : 'h-10 w-auto'}`}
                        />
                    </div>

                    {/* Collapse Toggle (Desktop Only) */}
                    <button
                        onClick={toggleCollapse}
                        className={`hidden lg:flex p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors ${isCollapsed ? 'absolute -right-3 top-6 bg-neutral-900 border border-neutral-800 shadow-md' : ''}`}
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={16} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3">
                    <NavItem
                        icon={LayoutDashboard}
                        label="Overview"
                        active={activeTab === 'Overview'}
                        onClick={() => handleNavClick('Overview')}
                        isCollapsed={isCollapsed}
                    />
                    <NavItem
                        icon={Bell}
                        label="Notifications"
                        active={activeTab === 'Notifications'}
                        onClick={() => handleNavClick('Notifications')}
                        isCollapsed={isCollapsed}
                        badge={unreadCount}
                    />
                    <NavItem
                        icon={MessageSquare}
                        label="Messages"
                        active={activeTab === 'Messages'}
                        onClick={() => handleNavClick('Messages')}
                        isCollapsed={isCollapsed}
                    />
                    <NavItem
                        icon={BarChart3}
                        label="Analytics"
                        active={activeTab === 'Analytics'}
                        onClick={() => handleNavClick('Analytics')}
                        isCollapsed={isCollapsed}
                    />
                    <NavItem
                        icon={Users}
                        label="Community"
                        active={activeTab === 'Community'}
                        onClick={() => handleNavClick('Community')}
                        isCollapsed={isCollapsed}
                    />
                    <NavItem
                        icon={Compass}
                        label="Discover"
                        active={activeTab === 'Discovery'}
                        onClick={() => handleNavClick('Discovery')}
                        isCollapsed={isCollapsed}
                    />

                    <div className="my-4 border-t border-neutral-800/50" />

                    {/* Knovera Chat Button */}
                    <button
                        onClick={() => router.push('/chat/new')}
                        title={isCollapsed ? "Start new chat" : undefined}
                        className={`
              flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} 
              py-3 mx-auto
              rounded-lg
              cursor-pointer
              bg-transparent border border-white/10
              text-white
              transition-all duration-200
              hover:bg-[#0a0a0a]
              active:bg-[#000000]
              group relative
              ${isCollapsed ? 'w-10 h-10 p-0' : 'w-full'}
            `}
                    >
                        <Brain size={18} className="shrink-0" />
                        {!isCollapsed && (
                            <span className="text-sm font-medium tracking-wide whitespace-nowrap">
                                knovera
                            </span>
                        )}
                        {/* Tooltip for collapsed mode */}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                                Start Chat
                            </div>
                        )}
                    </button>
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-neutral-800">
                    <div className="relative">
                        <button
                            className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} w-full p-2 rounded-lg hover:bg-neutral-900 transition-colors cursor-pointer group`}
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs overflow-hidden shrink-0">
                                {user?.user?.avatarUrl ? (
                                    <img src={user.user.avatarUrl} alt={user.user.displayName} className="w-full h-full object-cover" />
                                ) : (
                                    user?.user?.displayName?.substring(0, 2).toUpperCase() || 'U'
                                )}
                            </div>

                            {!isCollapsed && (
                                <>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-xs font-semibold truncate text-white">{user?.user?.displayName}</p>
                                        <p className="text-[10px] text-neutral-500 truncate">{user?.user?.role}</p>
                                    </div>
                                    <ChevronRight size={14} className={`text-neutral-500 transition-transform ${showUserMenu ? 'rotate-90' : ''}`} />
                                </>
                            )}
                        </button>

                        {/* User Menu Popup */}
                        {showUserMenu && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
                                <div className={`absolute bottom-full ${isCollapsed ? 'left-full ml-2' : 'left-0 right-0 mb-2'} bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl overflow-hidden z-40 min-w-[180px]`}>
                                    <button
                                        onClick={() => {
                                            handleNavClick('Profile');
                                            setShowUserMenu(false);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm text-white hover:bg-neutral-800 transition-colors flex items-center gap-3 border-b border-neutral-800"
                                    >
                                        <User size={16} />
                                        Profile
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleNavClick('Settings');
                                            setShowUserMenu(false);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm text-white hover:bg-neutral-800 transition-colors flex items-center gap-3 border-b border-neutral-800"
                                    >
                                        <Settings size={16} />
                                        Settings
                                    </button>
                                    <button
                                        onClick={() => {
                                            onLogout();
                                            setShowUserMenu(false);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
