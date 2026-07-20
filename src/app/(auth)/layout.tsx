export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-dark-background transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-dark-surface p-10 rounded-xl shadow-lg border border-slate-100 dark:border-dark-border transition-colors duration-300">
        {children}
      </div>
    </div>
  );
}
