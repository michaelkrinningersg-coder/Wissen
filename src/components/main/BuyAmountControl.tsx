import type { BuyAmount } from "../../game/state/store";

const OPTIONS: BuyAmount[] = [1, 5, 10, 25, 50, 100, "max"];

interface BuyAmountControlProps {
  value: BuyAmount;
  onChange: (v: BuyAmount) => void;
  unlocked: boolean;
}

export function BuyAmountControl({ value, onChange, unlocked }: BuyAmountControlProps) {
  return (
    <div className="buy-amount-control">
      {OPTIONS.map((opt) => {
        const disabled = opt !== 1 && !unlocked;
        return (
          <button
            key={String(opt)}
            type="button"
            className={opt === value ? "active" : ""}
            disabled={disabled}
            onClick={() => onChange(opt)}
            title={disabled ? 'Schaltet frei via Kern-Shop "Großeinkauf"' : undefined}
          >
            {opt === "max" ? "Max" : `x${opt}`}
          </button>
        );
      })}
    </div>
  );
}
