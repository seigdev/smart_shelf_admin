import type { SVGProps } from 'react';

export function ShelfPilotLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 10v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10" />
      <path d="M4 7l6-4 6 4" />
      <path d="M12 3v5" />
      <path d="M22 7l-10 5L2 7" />
      <path d="M17 13h-1.5a1.5 1.5 0 0 0 0 3H17" />
      <path d="M8.5 13H7a1.5 1.5 0 0 0 0 3h1.5" />
      <path d="m12 13.5 1.5-1.5-1.5-1.5" />
      <path d="m12 17.5 1.5-1.5-1.5-1.5" />
    </svg>
  );
}
