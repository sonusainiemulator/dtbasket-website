import { TEXT } from "@/branding";

export default function FeatureBanner() {
  return (
    <div className="bg-white dark:bg-dm-surface rounded-xl shadow-card p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {TEXT.features.map((f, i) => (
          <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start gap-3 p-3 rounded-xl hover:bg-primary-50 dark:hover:bg-dm-surface2 transition-colors">
            <span className="text-3xl flex-shrink-0">{f.icon}</span>
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-bold text-gray-800 dark:text-dm-text">{f.title}</h3>
              <p className="text-xs text-gray-500 dark:text-dm-muted mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
