import { useState } from "react";
import Button from "./Button";

//bump the version if you change the wording and want everyone to agree again
const KEY = "disclaimerAccepted_v1";

//shown once per browser, the user has to tick the box before they can continue
export default function ConsentModal() {
  const [open, setOpen] = useState(() => {
    try { return !localStorage.getItem(KEY); } catch { return true; }
  });
  const [checked, setChecked] = useState(false);

  if (!open) return null;

  function accept() {
    try { localStorage.setItem(KEY, "1"); } catch { /* private mode, it will just ask again next visit */ }
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
        className="flex w-full max-w-md flex-col gap-4 rounded-3xl bg-surface p-6 shadow-xl"
      >
        <h2 id="consent-title" className="text-2xl font-bold" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          Before you start
        </h2>

        <ul className="flex flex-col gap-2 text-[13px] text-text/80">
          <li>This app gives an automated estimate from a photo. It is <strong>not a diagnosis</strong>.</li>
          <li>It can miss skin cancers and can flag harmless spots. Neither result replaces a doctor.</li>
          <li>If a spot is changing, bleeding, or worrying you, see a doctor whatever the app says.</li>
          <li>Your photos are saved to your account. You can delete them or your whole account at any time from your profile.</li>
        </ul>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-bg p-3 text-[13px] focus-within:ring-2 focus-within:ring-primary">
          <input
            type="checkbox"
            autoFocus
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
          />
          <span>I understand this is a screening aid and not medical advice.</span>
        </label>

        <div className="[&>button]:w-full">
          <Button variant="primary" onClick={accept} disabled={!checked}>Continue</Button>
        </div>
      </div>
    </div>
  );
}
