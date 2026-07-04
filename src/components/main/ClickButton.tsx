interface ClickButtonProps {
  onClick: () => void;
  clickValueLabel: string;
}

export function ClickButton({ onClick, clickValueLabel }: ClickButtonProps) {
  return (
    <>
      <div className="click-button-wrap">
        <button type="button" className="click-button" onClick={onClick} aria-label="Wissen sammeln (klicken)">
          🧠
        </button>
      </div>
      <div className="click-value-hint">+{clickValueLabel} Wissen pro Klick</div>
    </>
  );
}
