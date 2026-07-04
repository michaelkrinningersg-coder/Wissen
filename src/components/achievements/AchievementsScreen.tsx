import { ACHIEVEMENTS } from "../../game/config/achievements";
import type { AchievementCategory, Player } from "../../game/types";
import { formatInt } from "../../game/format";
import { ProgressBar } from "../common/ProgressBar";

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  production: "🧠 Produktion",
  buildings: "🏗️ Gebäude",
  clicks: "🖱️ Klicks",
  prestige: "🔁 Prestige",
  cards: "🃏 Karten",
  time: "⏳ Zeit",
};

interface AchievementsScreenProps {
  player: Player;
}

export function AchievementsScreen({ player }: AchievementsScreenProps) {
  const categories = Object.keys(CATEGORY_LABELS) as AchievementCategory[];

  return (
    <div>
      <div className="section-title">
        🏆 Achievements ({player.achievements.length}/{ACHIEVEMENTS.length}) · {formatInt(player.achievementPoints)}{" "}
        Punkte
      </div>
      {categories.map((cat) => {
        const defs = ACHIEVEMENTS.filter((a) => a.category === cat);
        const unlockedInCat = defs.filter((a) => player.achievements.includes(a.id)).length;
        return (
          <div key={cat}>
            <div className="epoch-divider">
              {CATEGORY_LABELS[cat]} ({unlockedInCat}/{defs.length})
            </div>
            <ProgressBar fraction={defs.length > 0 ? unlockedInCat / defs.length : 0} />
            {defs.map((a) => {
              const unlocked = player.achievements.includes(a.id);
              return (
                <div key={a.id} className={`achievement-row${unlocked ? "" : " locked"}`}>
                  <span className="icon" aria-hidden="true">
                    {unlocked ? a.icon : "🔒"}
                  </span>
                  <span>
                    <div>
                      <strong>{a.name}</strong>
                    </div>
                    <div className="text-dim">{a.description}</div>
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
