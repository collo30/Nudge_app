import React from 'react';
import { Wallet } from 'lucide-react';

interface NudgeLogoProps {
    className?: string;
}

const NudgeLogo: React.FC<NudgeLogoProps> = ({ className = '' }) => (
    <img
        src="/icon-512.png?v=3"
        alt="Nudge logo"
        className={className}
        style={{ objectFit: 'contain' }}
    />
);

export default NudgeLogo;
