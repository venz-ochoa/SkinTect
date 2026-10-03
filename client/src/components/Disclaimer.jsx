//warning signs that apply no matter what the scan said
const warningSigns = [
  "It is growing, or changing in shape, color or texture",
  "It bleeds, crusts, itches, or won't heal",
  "It looks different from your other moles",
  "It has an uneven border or more than one color",
  "It is new and you are over 30, or you simply feel unsure",
];

//shown right under a scan result, the wording changes with the result
//usage: <ResultDisclaimer result={prediction} />   (prediction is "benign" or "malignant")
export function ResultDisclaimer({ result }) {
  const malignant = String(result).toLowerCase() === "malignant";

  return (
    <section
      role="note"
      aria-label="Important information about this result"
      className={`flex flex-col gap-3 rounded-2xl border p-4 ${
        malignant ? "border-malignant/30 bg-malignant/5" : "border-primary/20 bg-surface"
      }`}
    >
      <p className={`text-base font-bold ${malignant ? "text-malignant" : "text-text"}`}>
        {malignant ? "Please have this checked by a doctor" : "A benign result is not an all-clear"}
      </p>

      <p className="text-[13px] text-text/80">
        {malignant
          ? "This scan flagged the spot as possibly malignant. That is a reason to book a skin check soon, not a diagnosis. Only a doctor can tell you what it actually is."
          : "This tool can miss skin cancers, so a benign result does not rule one out. It only looks at one photo, and lighting, focus and skin tone can all affect how accurate it is."}
      </p>

      {/* the warning signs are the same for both results, but a malignant result tucks them away so the first message stays clear */}
      {malignant ? (
        <details className="text-[13px] text-text/80">
          <summary className="w-fit cursor-pointer rounded font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            Other signs worth mentioning to your doctor
          </summary>
          <ul className="mt-2 list-disc pl-5">
            {warningSigns.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </details>
      ) : (
        <div className="text-[13px] text-text/80">
          <p className="mb-1 font-medium">See a doctor, whatever the app says, if:</p>
          <ul className="list-disc pl-5">
            {warningSigns.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </div>
      )}

      <p className="text-[13px] text-text/80">
        You can download a PDF report of your scans from your profile to bring to your appointment.
      </p>

      <p className="border-t border-primary/15 pt-3 text-[13px] text-text/60">
        This app is a screening aid, not a medical diagnosis or a substitute for professional medical advice. It can be wrong in both directions: it can miss a skin cancer and it can flag a harmless spot. If you think you are having a medical emergency, call your local emergency number.
      </p>
    </section>
  );
}

//small line for the bottom of every page
export function FooterDisclaimer() {
  return (
    <p className="mx-auto max-w-2xl px-4 py-6 text-center text-[13px] text-text/60">
      This app is not a medical diagnosis. If you are worried about a spot on your skin, see a doctor.
    </p>
  );
}
