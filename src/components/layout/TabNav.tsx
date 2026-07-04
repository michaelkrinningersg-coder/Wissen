export type Tab = "main" | "prestige" | "cards" | "achievements" | "stats";

interface TabNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: "main", label: "Haupt", icon: "🧠" },
  { id: "prestige", label: "Epochen", icon: "🔁" },
  { id: "cards", label: "Karten", icon: "🃏" },
  { id: "achievements", label: "Erfolge", icon: "🏆" },
  { id: "stats", label: "Statistik", icon: "📊" },
];

export function TabNav({ active, onChange }: TabNavProps) {
  return (
    <nav className="tab-nav">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={tab.id === active ? "active" : ""}
          onClick={() => onChange(tab.id)}
          aria-current={tab.id === active}
        >
          <span className="tab-icon" aria-hidden="true">
            {tab.icon}
          </span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
