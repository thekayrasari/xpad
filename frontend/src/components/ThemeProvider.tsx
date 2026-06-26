import React, { useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { themeColors } = useSettingsStore();

    useEffect(() => {
        // We inject a style block into the document head to override Tailwind CSS variables
        const styleId = 'xpad-dynamic-theme';
        let styleEl = document.getElementById(styleId) as HTMLStyleElement;
        
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
        }

        styleEl.innerHTML = `
            :root {
                --catppuccin-color-base: ${themeColors.base} !important;
                --catppuccin-color-surface0: ${themeColors.surface0} !important;
                --catppuccin-color-surface1: ${themeColors.surface1} !important;
                --catppuccin-color-text: ${themeColors.text} !important;
                --catppuccin-color-subtext0: ${themeColors.subtext0} !important;
                --catppuccin-color-blue: ${themeColors.blue} !important;
                --catppuccin-color-green: ${themeColors.green} !important;
                --catppuccin-color-red: ${themeColors.red} !important;
                --catppuccin-color-mauve: ${themeColors.mauve} !important;
                --catppuccin-color-peach: ${themeColors.peach} !important;
                
                /* Fallbacks for standard formats just in case */
                --color-ctp-base: ${themeColors.base} !important;
                --color-ctp-surface0: ${themeColors.surface0} !important;
                --color-ctp-surface1: ${themeColors.surface1} !important;
                --color-ctp-text: ${themeColors.text} !important;
                --color-ctp-subtext0: ${themeColors.subtext0} !important;
                --color-ctp-blue: ${themeColors.blue} !important;
                --color-ctp-green: ${themeColors.green} !important;
                --color-ctp-red: ${themeColors.red} !important;
                --color-ctp-mauve: ${themeColors.mauve} !important;
                --color-ctp-peach: ${themeColors.peach} !important;
            }
        `;
    }, [themeColors]);

    return <>{children}</>;
};
