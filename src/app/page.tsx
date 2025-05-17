import { WaterLog } from '@/components/WaterLog';
import { Droplet } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center space-x-3">
          <Droplet className="h-8 w-8 text-primary" data-ai-hint="water drop" />
          <h1 className="text-3xl font-semibold tracking-tight">Daily Drops</h1>
        </div>
      </header>
      
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <WaterLog />
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border">
        <p>&copy; {new Date().getFullYear()} Daily Drops. Stay Hydrated!</p>
      </footer>
    </div>
  );
}
