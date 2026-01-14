import { cn } from '@/lib/utils';

export default function ResponsiveGrid({ children, className, cols = { sm: 1, md: 2, lg: 3, xl: 4 } }) {
    const gridClasses = cn(
        'grid gap-4 sm:gap-6',
        `grid-cols-${cols.sm}`,
        `sm:grid-cols-${cols.sm}`,
        `md:grid-cols-${cols.md}`,
        `lg:grid-cols-${cols.lg}`,
        `xl:grid-cols-${cols.xl}`,
        className
    );

    return (
        <div className={gridClasses}>
            {children}
        </div>
    );
}
