import { JSX, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useSidebar } from '../../hooks/use-sidebar.js';
import { cn } from '../../lib/utils.js';
import { Nav } from './nav.js';
import { sidelinks } from './sidelinks.js';

type SidebarProps = {
  className?: string;
};

export function Sidebar({ className }: SidebarProps): JSX.Element {
  const { isMinimized, toggle } = useSidebar();
  const [status, setStatus] = useState(false);

  const handleToggle = (): void => {
    setStatus(true);
    toggle();
    setTimeout(() => setStatus(false), 300);
  };

  return (
    <nav
      className={cn(
        'relative hidden h-screen flex-none border-r z-10 pt-10 md:block bg-white',
        status && 'duration-300',
        isMinimized ? 'w-[72px]' : 'w-[240px]',
        className,
      )}
    >
      <ChevronLeft
        className={cn(
          'absolute -right-3 top-20 cursor-pointer bg-gray-300 border-black/75 rounded-full border text-3xl text-foreground',
          isMinimized && 'rotate-180',
        )}
        onClick={handleToggle}
      />
      <div className="px-3 py-2">
        <div className="mt-3 space-y-1">
          <Nav links={sidelinks} isCollapsed={isMinimized} closeNav={handleToggle} />
        </div>
      </div>
    </nav>
  );
}
