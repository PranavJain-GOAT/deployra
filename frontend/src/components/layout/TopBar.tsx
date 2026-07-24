import { Search, Command } from 'lucide-react';

interface TopBarProps {
  title: string;
  subtitle?: string;
  onOpenCommand: () => void;
}

export default function TopBar({ title, subtitle, onOpenCommand }: TopBarProps) {
  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-border bg-background shrink-0">
      <div>
        <h1 className="text-sm font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      </div>

      <button
        onClick={onOpenCommand}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border
                   text-muted hover:text-foreground hover:border-zinc-600
                   transition-colors duration-150 text-xs"
      >
        <Search size={12} />
        <span>Search</span>
        <span className="flex items-center gap-0.5 ml-1">
          <kbd className="px-1 py-0.5 bg-card border border-border rounded text-[10px] font-mono">⌘</kbd>
          <kbd className="px-1 py-0.5 bg-card border border-border rounded text-[10px] font-mono">K</kbd>
        </span>
      </button>
    </header>
  );
}
