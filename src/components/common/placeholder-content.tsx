import type React from 'react';
import { PageTitle } from './page-title';
import { Construction } from 'lucide-react';

interface PlaceholderContentProps {
  title: string;
  description?: string;
}

export function PlaceholderContent({ title, description }: PlaceholderContentProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <Construction className="mb-6 h-16 w-16 text-muted-foreground" />
      <PageTitle title={title} />
      {description && (
        <p className="mt-2 max-w-md text-muted-foreground">{description}</p>
      )}
      <p className="mt-6 text-sm text-muted-foreground">
        This feature is currently under development. Check back soon!
      </p>
    </div>
  );
}
