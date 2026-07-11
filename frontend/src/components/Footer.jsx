export default function Footer() {
  return (
    <footer className="mt-20 border-t border-dawn/50 py-8">
      <div className="max-w-3xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-ink/60">
        <p>© {new Date().getFullYear()} SoulScript. Thoughts, out loud.</p>
        <p className="font-mono text-xs">Built with React, Node & MongoDB</p>
      </div>
    </footer>
  );
}
