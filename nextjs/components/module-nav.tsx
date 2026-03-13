'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ModuleNavProps {
  grade: string;
}

export function ModuleNav({ grade }: ModuleNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const unit = searchParams.get('unit');

  const modules = [
    { id: 'learn', name: '学单词', icon: '📖' },
    { id: 'read', name: '读单词', icon: '📚' },
    { id: 'write', name: '写单词', icon: '✏️' },
    { id: 'dictation', name: '听写', icon: '🎧' },
  ];

  const baseUrl = `/module`;
  const query = unit ? `?grade=${encodeURIComponent(grade)}&unit=${unit}` : `?grade=${encodeURIComponent(grade)}`;

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
      {modules.map((module) => {
        const href = `${baseUrl}/${module.id}${query}`;
        const isActive = pathname?.includes(module.id);

        return (
          <Link key={module.id} href={href}>
            <a
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              <span>{module.icon}</span>
              <span>{module.name}</span>
            </a>
          </Link>
        );
      })}
    </div>
  );
}
