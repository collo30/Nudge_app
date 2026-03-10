
import { useState } from "react";
import { ArrowLeft, User, Bell, Shield, Database, Github } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Settings() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full bg-background safe-area-top">
            <header className="p-4 flex items-center border-b border-white/5 bg-surface/80 backdrop-blur-md sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 -ml-2 rounded-full hover:bg-white/10">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Settings</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">

                <Section title="Account">
                    <SettingItem icon={<User size={20} />} label="Profile" sublabel="Manage your local profile" />
                    <SettingItem icon={<Bell size={20} />} label="Notifications" sublabel="Playback controls" toggle />
                </Section>

                <Section title="Privacy & Data">
                    <SettingItem icon={<Shield size={20} />} label="Privacy Policy" />
                    <SettingItem icon={<Database size={20} />} label="Storage" sublabel="Clear cache" />
                </Section>

                <Section title="About">
                    <div className="p-4 rounded-2xl bg-surface border border-white/5 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-4 shadow-lg flex items-center justify-center">
                            <span className="text-2xl">🎵</span>
                        </div>
                        <h3 className="text-lg font-bold text-white">Echo Player</h3>
                        <p className="text-white/40 text-sm mb-4">v1.0.0 (Alpha)</p>
                        <a
                            href="https://github.com/yourusername/echo-player"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium hover:bg-white/20 transition-colors"
                        >
                            <Github size={16} />
                            Source Code
                        </a>
                    </div>
                </Section>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div>
            <h2 className="text-sm font-semibold text-primary/80 uppercase tracking-wider mb-2 px-2">{title}</h2>
            <div className="bg-surface rounded-2xl overflow-hidden border border-white/5 divide-y divide-white/5">
                {children}
            </div>
        </div>
    );
}

function SettingItem({ icon, label, sublabel, toggle }: { icon: React.ReactNode, label: string, sublabel?: string, toggle?: boolean }) {
    const [enabled, setEnabled] = useState(true);

    return (
        <div className="p-4 flex items-center justify-between active:bg-white/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
                <div className="text-white/60">{icon}</div>
                <div>
                    <div className="font-medium text-white">{label}</div>
                    {sublabel && <div className="text-xs text-white/40">{sublabel}</div>}
                </div>
            </div>
            {toggle ? (
                <button
                    onClick={() => setEnabled(!enabled)}
                    className={`w-12 h-7 rounded-full transition-colors relative ${enabled ? 'bg-primary' : 'bg-white/20'}`}
                >
                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            ) : (
                <div className="text-white/20 text-lg">›</div>
            )}
        </div>
    );
}
