export function CountInButton({ ciOn, onClick }) {
  return (
    <div
      className={`icon-btn ci-icon-btn${ciOn ? ' active' : ''}`}
      onClick={onClick}
      aria-label={ciOn ? 'Count-in on — click to disable' : 'Enable count-in'}
    >
      <div className="ci-inner">
        <div className="ci-arc" />
        <div className="ci-bars">
          <div className="ci-bar b1" />
          <div className="ci-bar b2" />
          <div className="ci-bar b3" />
          <div className="ci-bar b4" />
        </div>
      </div>
    </div>
  )
}
