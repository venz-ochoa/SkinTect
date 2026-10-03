import { locationLabel } from "./bodyLocations";

const REPORT_DISCLAIMER =
  "This report lists the results of an automated screening app. It is not a medical diagnosis and it is not a substitute for professional medical advice. " +
  "The app can miss skin cancers and can flag harmless spots, so every spot listed here, whatever its result, should be judged by a healthcare professional. " +
  "Bring this report to your appointment as a record of when each photo was taken and what the app said.";

//colors used in the pdf (r, g, b)
const INK = [46, 59, 48];
const MUTED = [110, 120, 112];
const TEAL = [13, 148, 136];
const RED = [220, 38, 38];
const LINE = [214, 220, 215];

//the server stores malignant_probability as a number, this handles both 0-1 and 0-100
function toPercent(p) {
  const n = Number(p);
  if (!Number.isFinite(n)) return null;
  return Math.round((n <= 1 ? n * 100 : n) * 10) / 10;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

//the browser decodes whatever format was uploaded, then it is re-saved as a small jpeg
//so the pdf stays light even with a lot of scans
async function toJpeg(src, maxPx = 500) {
  const img = await loadImage(src);
  const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return { data: canvas.toDataURL("image/jpeg", 0.8), w, h };
}

//photo and heatmap come from the server as base64 text (or already as a data url)
const asSrc = (value, mime) =>
  value.startsWith("data:") ? value : `data:${mime};base64,${value}`;

async function safeJpeg(value, mime) {
  if (!value) return null;
  try {
    return await toJpeg(asSrc(value, mime));
  } catch {
    return null;
  }
}

//scans: the array that GET /api/scans returns. user: the object from GET /api/me
export async function generateReport({ user, scans }) {
  if (!scans || scans.length === 0)
    throw new Error("You don't have any saved scans to export yet.");

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const PAGE_W = 210;
  const PAGE_H = 297;
  const M = 16; //page margin
  const BOTTOM = PAGE_H - 20; //leave room for the footer
  let y = M;

  const color = (c) => doc.setTextColor(c[0], c[1], c[2]);
  const ensure = (needed) => {
    if (y + needed > BOTTOM) {
      doc.addPage();
      y = M;
    }
  };

  //---- header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  color(INK);
  doc.text("Skin scan report", M, y + 6);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  color(MUTED);
  const who = [user?.name, user?.email].filter(Boolean).join("  |  ");
  if (who) {
    doc.text(who, M, y);
    y += 5.5;
  }
  doc.text(
    `Generated ${new Date().toLocaleDateString([], { dateStyle: "long" })}`,
    M,
    y,
  );
  y += 8;

  //---- summary
  const sorted = [...scans].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at),
  );
  const benign = scans.filter((s) => s.prediction === "benign").length;
  const malignant = scans.filter((s) => s.prediction === "malignant").length;
  const first = new Date(sorted[0].created_at).toLocaleDateString([], {
    dateStyle: "medium",
  });
  const last = new Date(
    sorted[sorted.length - 1].created_at,
  ).toLocaleDateString([], { dateStyle: "medium" });

  doc.setDrawColor(...LINE);
  doc.line(M, y, PAGE_W - M, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  color(INK);
  doc.text("Summary", M, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(
    `${scans.length} ${scans.length === 1 ? "scan" : "scans"} from ${first} to ${last}`,
    M,
    y,
  );
  y += 5.5;
  doc.text(
    `${benign} benign, ${malignant} malignant (as estimated by the app)`,
    M,
    y,
  );
  y += 9;

  //---- disclaimer box
  doc.setFontSize(10);
  const disclaimerLines = doc.splitTextToSize(
    REPORT_DISCLAIMER,
    PAGE_W - M * 2 - 8,
  );
  const boxH = disclaimerLines.length * 4.6 + 12;
  doc.setFillColor(244, 246, 244);
  doc.setDrawColor(...LINE);
  doc.roundedRect(M, y, PAGE_W - M * 2, boxH, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  color(INK);
  doc.text("Important", M + 4, y + 6);
  doc.setFont("helvetica", "normal");
  color(MUTED);
  doc.text(disclaimerLines, M + 4, y + 11.5);
  y += boxH + 10;

  //---- scans, grouped by body area, oldest first inside each area
  const groups = new Map();
  for (const s of sorted) {
    const key = s.body_location || "untagged";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  //biggest groups first, scans with no area last
  const ordered = [...groups.entries()].sort((a, b) => {
    if (a[0] === "untagged") return 1;
    if (b[0] === "untagged") return -1;
    return b[1].length - a[1].length;
  });

  const IMG = 38; //photo and heatmap are drawn inside a square this big
  const ROW = IMG + 8;

  for (const [loc, list] of ordered) {
    ensure(14 + ROW);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    color(INK);
    doc.text(
      `${locationLabel(loc)}  (${list.length} ${list.length === 1 ? "scan" : "scans"})`,
      M,
      y + 5,
    );
    y += 9;
    doc.setDrawColor(...LINE);
    doc.line(M, y, PAGE_W - M, y);
    y += 5;

    for (const s of list) {
      ensure(ROW);
      const [photo, heat] = await Promise.all([
        safeJpeg(s.photo, "image/jpeg"),
        safeJpeg(s.heatmap, "image/png"),
      ]);

      //draws an image scaled to fit the square, or a grey box if it could not be loaded
      const drawImage = (img, x, label) => {
        if (!img) {
          doc.setFillColor(244, 246, 244);
          doc.rect(x, y, IMG, IMG, "F");
          doc.setFontSize(8);
          color(MUTED);
          doc.text("No preview", x + IMG / 2, y + IMG / 2, { align: "center" });
          return;
        }
        const k = Math.min(IMG / img.w, IMG / img.h);
        const w = img.w * k;
        const h = img.h * k;
        doc.addImage(
          img.data,
          "JPEG",
          x + (IMG - w) / 2,
          y + (IMG - h) / 2,
          w,
          h,
        );
        doc.setFontSize(7.5);
        color(MUTED);
        doc.text(label, x + IMG / 2, y + IMG + 3.5, { align: "center" });
      };

      drawImage(photo, M, "Photo");
      drawImage(heat, M + IMG + 4, "Heatmap");

      //the details next to the pictures
      const tx = M + (IMG + 4) * 2 + 2;
      const isMalignant = s.prediction === "malignant";
      const pct = toPercent(s.malignant_probability);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      color(MUTED);
      doc.text("Date", tx, y + 5);
      doc.text("App result", tx, y + 15);
      doc.text("Malignant probability", tx, y + 25);

      doc.setFontSize(11);
      color(INK);
      doc.text(
        new Date(s.created_at).toLocaleString([], {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        tx,
        y + 10,
      );
      doc.setFont("helvetica", "bold");
      color(isMalignant ? RED : TEAL);
      doc.text(
        isMalignant ? "Flagged as possibly malignant" : "Benign",
        tx,
        y + 20,
      );
      doc.setFont("helvetica", "normal");
      color(INK);
      doc.text(pct === null ? "n/a" : `${pct}%`, tx, y + 30);

      y += ROW;
    }
    y += 4;
  }

  //---- footer on every page
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...LINE);
    doc.line(M, PAGE_H - 14, PAGE_W - M, PAGE_H - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    color(MUTED);
    doc.text(
      "Automated screening results. Not a medical diagnosis.",
      M,
      PAGE_H - 9,
    );
    doc.text(`Page ${i} of ${pages}`, PAGE_W - M, PAGE_H - 9, {
      align: "right",
    });
  }

  doc.save(`skin-scan-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
