import React from 'react';

export interface VIconProps extends React.ComponentPropsWithoutRef<'svg'> {
    size?: string | number;
}

export const VIcon = React.forwardRef<SVGSVGElement, VIconProps>(
    ({ color = 'currentColor', size = 24, width, height, strokeWidth = 2, ...props }, ref) => {
        const s = size;
        return (
            <svg
                ref={ref}
                xmlns="http://www.w3.org/2000/svg"
                width={width ?? s}
                height={height ?? s}
                viewBox="0 0 24 24"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                {...props}
            >
                <path d="M5 5L12 19L19 5" />
            </svg>
        );
    }
);

VIcon.displayName = 'VIcon';
