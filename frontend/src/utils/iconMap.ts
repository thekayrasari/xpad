import * as LucideIcons from 'lucide-react';
import { VIcon } from '../components/icons/VIcon';
import React from 'react';

export const ICON_MAP: Record<string, React.ComponentType<any>> = {
    ...(LucideIcons as any),
    VIcon: VIcon as any
};
