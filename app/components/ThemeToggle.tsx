'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

const ThemeToggle: React.FC = () => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? '🌞' : '🌙'}
        </button>
    );
};

export default ThemeToggle;