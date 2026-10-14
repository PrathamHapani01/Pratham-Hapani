import { useState } from "react";
import PixelWindow from "../components/PixelWindow";
import PixelButton from "../components/PixelButton";
import PixelIcon from "../components/PixelIcon";
import { sendContact } from "../api/client";

const EMPTY = { name: "", email: "", message: "", website: "" };

function validEmail(value) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
}

export default function Contact({ profile }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [shake, setShake] = useState(false);
  const [sent, setSent] = useState(false);
  const [plane, setPlane] = useState(false);
  const socials = profile.socials || {};

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!validEmail(form.email.trim())) next.email = "Enter a valid email.";
    if (form.message.trim().length < 5) next.message = "Message should be at least 5 characters.";
    setErrors(next);
    if (Object.keys(next).length) {
      setShake(true);
      window.setTimeout(() => setShake(false), 200);
      return;
    }
    setStatus("");
    try {
      await sendContact({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        website: form.website,
      });
      setSent(true);
      setPlane(true);
      setForm(EMPTY);
      window.dispatchEvent(new CustomEvent("ali:say", { detail: { text: "Delivered!", variant: "speech" } }));
      window.dispatchEvent(new Event("pixel-confetti"));
      window.setTimeout(() => setPlane(false), 900);
    } catch (error) {
      const text = error.status === 429
        ? "Too many messages. Try again in a few minutes."
        : (error.message || "Could not send the message.");
      setStatus(text);
      setShake(true);
      window.setTimeout(() => setShake(false), 200);
      if (error.status === 429) {
        window.dispatchEvent(new CustomEvent("ali:say", { detail: { text: "Too many messages! Give me a sec.", variant: "shout" } }));
      }
    }
  }

  return (
    <section id="contact" className="section">
      <PixelWindow title="CONTACT.MSG">
        <div className="contact-grid">
          {sent ? (
            <p role="status">MESSAGE SENT. Pratham will read it soon.</p>
          ) : (
            <form className={shake ? "shake" : ""} onSubmit={onSubmit} noValidate>
              <div className="hp" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(event) => update("website", event.target.value)}
                />
              </div>
              <label className="field">
                Name
                <input name="name" value={form.name} onChange={(event) => update("name", event.target.value)} required />
                {errors.name ? <span className="err">{errors.name}</span> : null}
              </label>
              <label className="field">
                Email
                <input name="email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required />
                {errors.email ? <span className="err">{errors.email}</span> : null}
              </label>
              <label className="field">
                Message
                <textarea name="message" value={form.message} onChange={(event) => update("message", event.target.value)} required />
                {errors.message ? <span className="err">{errors.message}</span> : null}
              </label>
              {status ? <p className="err" role="alert">{status}</p> : null}
              <span className="send-slot">
                <PixelButton type="submit">Send</PixelButton>
                <i className={`paper-plane${plane ? " is-go" : ""}`} aria-hidden="true" />
              </span>
            </form>
          )}
          <div className="social-col">
            <a className="px-btn secondary" href={socials.github || "#"} target="_blank" rel="noreferrer">
              <PixelIcon name="github" /> GitHub
            </a>
            <a className="px-btn secondary" href={socials.linkedin || "#"} target="_blank" rel="noreferrer">
              <PixelIcon name="linkedin" /> LinkedIn
            </a>
            <a className="px-btn secondary" href={socials.email || "#"}>
              <PixelIcon name="mail" /> Email
            </a>
          </div>
        </div>
      </PixelWindow>
    </section>
  );
}
