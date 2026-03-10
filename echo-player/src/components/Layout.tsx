
import { Link, useLocation } from "react-router-dom";
import { Search, ListMusic, User, Settings } from "lucide-react";
import MiniPlayer from "./MiniPlayer";
import { cn } from "../utils/cn";

export default function Layout({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const isPlayerScreen = location.pathname === '/player';

    if (isPlayerScreen) {
        return (
            <div className="flex flex-col h-screen w-full bg-background text-text overflow-hidden">
                {children}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-full bg-background text-text overflow-hidden select-none">
            <main className="flex-1 overflow-y-auto w-full max-w-lg mx-auto bg-surface/5 shadow-2xl relative">
                {children}
            </main>

            {/* Mini Player */}
            <MiniPlayer />

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-6 z-40 safe-area-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <NavItem to="/" icon={<ListMusic size={26} />} label="Library" active={location.pathname === "/"} />
                <NavItem to="/search" icon={<Search size={26} />} label="Search" active={location.pathname === "/search"} />
                <NavItem to="/settings" icon={<Settings size={26} />} label="Settings" active={location.pathname === "/settings"} />
            </nav>
        </div>
    );
}

function NavItem({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) {
    return (
        <Link to={to} className="flex flex-col items-center justify-center w-16 h-full active:scale-95 transition-transform">
            <div className={cn(
                "mb-1 transition-all duration-300",
                active ? "text-primary scale-110 filter drop-shadow-[0_0_12px_rgba(139,92,246,0.5)]" : "text-white/30 hover:text-white/60"
            )}>
                {icon}
            </div>
        </Link>
    );
}
