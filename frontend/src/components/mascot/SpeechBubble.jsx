import { forwardRef, useEffect, useState } from "react";

const ACTION_LABELS = {
  "scroll:home": "HOME",
  "scroll:about": "ABOUT",
  "scroll:skills": "SKILLS",
  "scroll:projects": "OPEN PROJECTS",
  "scroll:experience": "EXPERIENCE",
  "scroll:contact": "CONTACT",
};

const SpeechBubble = forwardRef(function SpeechBubble({
  variant,
  text,
  typing,
  side,
  pos,
  suggestions,
  action,
  showInput,
  draft,
  onDraft,
  onSend,
  onSuggest,
  onAction,
}, ref) {
  const [count, setCount] = useState(text.length);

  useEffect(() => {
    if (!typing) {
      setCount(text.length);
      return undefined;
    }
    setCount(0);
    const id = setInterval(() => {
      setCount((current) => {
        if (current >= text.length) {
          clearInterval(id);
          return current;
        }
        return current + 1;
      });
    }, 30);
    return () => clearInterval(id);
  }, [text, typing]);

  const shown = typing ? text.slice(0, count) : text;
  const tailSide = side || "above";

  return (
    <div
      ref={ref}
      className={`bubble ${variant}`}
      style={{ left: pos.left, top: pos.top, visibility: pos.ready ? "visible" : "hidden" }}
      onClick={() => setCount(text.length)}
    >
      {variant === "thought" ? (
        <div className="thought-dots" aria-hidden="true">
          <i /><i /><i />
        </div>
      ) : (
        <p className="bubble-text">{shown}</p>
      )}
      {variant !== "thought" && variant !== "whisper" ? (
        <span className={`bubble-tail tail-${tailSide}`} aria-hidden="true"><span /></span>
      ) : null}
      {variant === "thought" ? <span className={`thought-puffs puffs-${tailSide}`} aria-hidden="true"><i /><i /><i /></span> : null}
      {showInput ? (
        <>
          <form
            className="bubble-form"
            onSubmit={(event) => {
              event.preventDefault();
              onSend(draft);
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <label className="sr-only" htmlFor="ali-q">Ask Ali</label>
            <input
              id="ali-q"
              value={draft}
              maxLength={500}
              onChange={(event) => onDraft(event.target.value)}
              autoComplete="off"
            />
            <button type="submit" className="px-btn">Send</button>
          </form>
          <div className="quick-row">
            {(suggestions || []).slice(0, 3).map((item) => (
              <button key={item} type="button" className="chip" onClick={() => onSuggest(item)}>
                {item}
              </button>
            ))}
            {action && ACTION_LABELS[action] ? (
              <button type="button" className="chip is-active" onClick={() => onAction(action)}>
                {ACTION_LABELS[action]}
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
});

export default SpeechBubble;
