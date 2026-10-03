import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import defaultProfile from "../images/default_profile.jpg";
import FormField from "../components/Formfield";
import SplitBar from "../components/Splitbar";
import bannerArt from "../images/svg/profile-banner.svg";
import cameraIcon from "../images/svg/camera.svg";
import editIcon from "../images/svg/edit.svg";
import historyIcon from "../images/svg/history.svg";
import logoutIcon from "../images/svg/logout.svg";
import trashRedIcon from "../images/svg/trash-red.svg";
import mailIcon from "../images/svg/mail.svg";
import chevronIcon from "../images/svg/chevron-right.svg";
import scanIcon from "../images/svg/scan.svg";
import checkTealIcon from "../images/svg/check-circle-teal.svg";
import alertRedIcon from "../images/svg/alert-red.svg";
import clockIcon from "../images/svg/clock.svg";
import pulseIcon from "../images/svg/pulse.svg";
import downloadIcon from "../images/svg/download.svg";
import ThemeToggle from "../components/ThemeToggle";
import TrendsChart from "../components/TrendsChart";
import { FooterDisclaimer } from "../components/Disclaimer";
import { locationLabel } from "../lib/bodyLocations";
import { generateReport } from "../lib/report";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//this is for displaying the user profile
export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  //this is for editing
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [pic, setPic] = useState(null);

  //this is for deleting
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  //this is where we get user data and then have it displayed on their profile
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/me`, { credentials: "include" })
      .then((r) => r.json())
      //saves the user credential into user, such as email and name (to be added)
      .then(setUser);
  }, []);

  //when the user logs out, it redirects them back to the signup page
  async function logout() {
    await fetch(`${API_BASE_URL}/api/logout`, { method: "POST", credentials: "include" });
    navigate("/signup");
  }

  //this is for saving the profile changes (name, password, and profile picture)
  async function save() {
    if (pic) {
      const body = new FormData(); body.append("image", pic);
      const res = await fetch(`${API_BASE_URL}/api/me/profile`, { method: "POST", credentials: "include", body });
      
      //if the server rejects the picture, stop the reload and show the error
      if (!res.ok) {
        const errData = await res.json();
        alert("Picture upload failed: " + (errData.error || "Unknown error"));
        return; 
      }
    }
    
    if (name !== user.name || password) {
      const res = await fetch(`${API_BASE_URL}/api/me`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || user.name, password })
      });

      if (!res.ok) {
        const errData = await res.json();
        alert("Profile update failed: " + (errData.error || "Unknown error"));
        return;
      }
    }
    //if everything went fine, reloads
    window.location.reload(); 
  }

  //this is for deleting the account
  async function deleteAccount() {
    const res = await fetch(`${API_BASE_URL}/api/me`, {
      method: "DELETE", 
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: deletePassword })
    });
    
    if (!res.ok) {
      const errData = await res.json();
      alert("Deletion failed: " + (errData.error || "Unknown error"));
      return;
    }
    
    onLogout();
    navigate("/signup");

    //if successful, sends them to signup page
    navigate("/signup");
  }

  //claude generated UI

  //activity: pulls the user's scan counts from the stats route
  const [stats, setStats] = useState(null);
  const [statsFailed, setStatsFailed] = useState(false);
  //this is for the show password button while editing
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    //start of today in the user's own timezone
    const since = new Date();
    since.setHours(0, 0, 0, 0);

    fetch(`${API_BASE_URL}/api/scans/stats?since=${since.toISOString()}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => (d.error ? setStatsFailed(true) : setStats(d)))
      .catch(() => setStatsFailed(true));
  }, []);

  //recent scans list
  const [scans, setScans] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/scans/recent?limit=5`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setScans(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  //trends: scans per week (split into benign and malignant) and how many scans per body area
  const [trendWeeks, setTrendWeeks] = useState(12);
  const [trends, setTrends] = useState(null);
  const [trendsFailed, setTrendsFailed] = useState(false);

  useEffect(() => {
    //the user's own timezone, so the server puts each scan in the right week
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    fetch(`${API_BASE_URL}/api/scans/trends?weeks=${trendWeeks}&tz=${encodeURIComponent(tz)}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) return setTrendsFailed(true);
        setTrends(d);
        setTrendsFailed(false);
      })
      .catch(() => setTrendsFailed(true));
  }, [trendWeeks]);

  //this is for the PDF report, it needs the full photos so it uses the history route
  const [exporting, setExporting] = useState(false);
  async function exportReport() {
    if (exporting) return;
    setExporting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/scans`, { credentials: "include" });
      const all = await res.json();
      if (!res.ok) throw new Error(all.error || "Could not load your scans");
      await generateReport({ user, scans: all });
    } catch (err) {
      alert("Report failed: " + (err.message || "Unknown error"));
    } finally {
      setExporting(false);
    }
  }

  const todayCount = stats?.today ?? 0;
  const benignCount = stats?.benign ?? 0;
  const malignantCount = stats?.malignant ?? 0;
  const total = benignCount + malignantCount;
  const activityLoading = !stats && !statsFailed;
  const show = (n) => (activityLoading || statsFailed ? "–" : n);

  function timeAgo(d) {
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
    return d.toLocaleDateString([], { dateStyle: "medium" });
  }

  //preview of the photo the user just picked
  const picUrl = pic ? URL.createObjectURL(pic) : null;
  const avatarSrc = picUrl || (user?.profile ? `data:image/jpeg;base64,${user.profile}` : defaultProfile);
  const avatar = "h-32 w-32 rounded-full object-cover ring-2 ring-accent";
  const serif = { fontFamily: "Georgia, 'Times New Roman', serif" };
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
  //icon helper, the size is in px
  const ic = (src, size, cls) => <img src={src} alt="" width={size} height={size} className={cls} />;
  //for icons that are not imported at the top
  const svg = (name) => new URL(`../images/svg/${name}.svg`, import.meta.url).href;
  //button has no classname prop, so the wrappers below stretch buttons to full width
  const stack = "flex flex-col gap-3 [&>button]:w-full";
  //formfield has no classname prop either, so inputs are styled from the wrapper
  const fields =
    "flex flex-col gap-4 [&_label]:font-medium [&_input]:w-full [&_input]:rounded-lg [&_input]:bg-bg [&_input]:px-3 [&_input]:py-2.5 [&_input]:font-normal [&_input]:focus:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-primary";
  //the rows in the action list
  const row =
    "group flex w-full items-center gap-3 rounded-xl bg-bg px-3 py-3 text-left transition-colors hover:bg-accent/15 " + focusRing;
  const rowIcon = "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/30 text-primary";
  const chevron = (
    <span className="text-text/40 transition-transform group-hover:translate-x-0.5">{ic(chevronIcon, 18, "opacity-60")}</span>
  );

  const tiles = [
    { label: "Scans today", value: show(todayCount), tone: "text-text", chip: "bg-primary/15 text-primary", icon: scanIcon },
    { label: "Benign", value: show(benignCount), tone: "text-benign", chip: "bg-benign/15 text-benign", icon: checkTealIcon },
    { label: "Malignant", value: show(malignantCount), tone: "text-malignant", chip: "bg-malignant/10 text-malignant", icon: alertRedIcon },
  ];
  const rows = [
    {
      icon: editIcon,
      title: "Edit Profile",
      sub: "Name, photo and password",
      onClick: () => { setIsEditing(true); setName(user.name); setPassword(""); setPic(null); setIsDeleting(false); setShowPw(false); },
    },
    { icon: historyIcon, title: "View Scan History", sub: "Every scan you've saved", onClick: () => navigate("/history") },
    {
      icon: downloadIcon,
      title: "Download PDF Report",
      sub: exporting ? "Preparing your report..." : "Photos, results and dates to bring to a doctor",
      onClick: exportReport,
    },
    { icon: logoutIcon, title: "Log out", onClick: logout },
  ];

  //not logged in, the server sends back an error object instead of null
  if (!user || user.error) {
    return (
      <main className="mx-auto max-w-md px-4 py-8 md:px-6">
        <Card>
          <div className="flex flex-col items-center gap-4 p-4 text-center">
            <p className="text-base">You are not logged in.</p>
            <div className="w-full [&>button]:w-full">
              <Button variant="primary" onClick={() => navigate("/login")}>Log in</Button>
            </div>
          </div>
        </Card>
      </main>
    );
  }

  //save stays off until something actually changed
  const changed = !!pic || !!password || (name.trim() !== "" && name !== user.name);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      {/*page animations*/}
      <style>{`
        /*shared motion, every class is switched off for reduced motion*/
        @keyframes st-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @keyframes st-pop { from { opacity: 0; transform: scale(.94); } to { opacity: 1; transform: none; } }
        @keyframes st-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes st-sheet { from { opacity: 0; transform: translateY(56px); } to { opacity: 1; transform: none; } }
        @keyframes st-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes st-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes st-ring { from { stroke-dashoffset: var(--len); } to { stroke-dashoffset: var(--to); } }
        @keyframes st-shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(3px); } }
        @property --st-n { syntax: "<integer>"; inherits: false; initial-value: 0; }
        @keyframes st-count { from { --st-n: 0; } to { --st-n: var(--to); } }
        .st-rise { animation: st-rise .55s cubic-bezier(.2, .7, .2, 1) backwards; animation-delay: var(--d, 0ms); }
        .st-pop { animation: st-pop .4s cubic-bezier(.2, .9, .3, 1.15) backwards; animation-delay: var(--d, 0ms); }
        .st-fade { animation: st-fade .45s ease-out backwards; animation-delay: var(--d, 0ms); }
        .st-dialog { animation: st-sheet .45s cubic-bezier(.2, .7, .2, 1) backwards; }
        @media (min-width: 640px) { .st-dialog { animation-name: st-pop; } }
        .st-float { animation: st-float 4s ease-in-out infinite; }
        .st-grow { transform-origin: left; animation: st-grow .9s cubic-bezier(.2, .7, .2, 1) .3s backwards; }
        .st-ring { animation: st-ring 1.1s cubic-bezier(.2, .7, .2, 1) .25s backwards; }
        .st-alert { animation: st-pop .35s ease-out backwards, st-shake .45s .15s; }
        .st-count { --st-n: var(--to); animation: st-count 1.1s cubic-bezier(.2, .7, .2, 1) .3s backwards; counter-reset: st-n var(--st-n); }
        .st-count::after { content: counter(st-n); }
        main button:not(:disabled):active { transform: scale(.97); }
        @media (prefers-reduced-motion: reduce) { .st-rise, .st-pop, .st-fade, .st-dialog, .st-float, .st-grow, .st-ring, .st-alert, .st-count { animation: none; } }
      `}</style>
      <h1 className="st-rise mb-6 text-2xl font-bold" style={serif}>Profile</h1>

      <div className="grid items-start gap-6 md:grid-cols-5">
        {/* left: profile */}
        <section aria-label="Your profile" className="st-rise overflow-hidden rounded-3xl bg-surface shadow-sm md:sticky md:top-6 md:col-span-2" style={{ "--d": "60ms" }}>
          {/* banner art */}
          <div className="h-32 overflow-hidden bg-accent/25" aria-hidden="true">
            <img src={bannerArt} alt="" className="h-full w-full object-cover" />
          </div>

          <div className="flex flex-col gap-6 px-5 pb-6 sm:px-6">
            {/* avatar sits exactly on the banner edge */}
            <div className="-mt-16 flex flex-col items-center gap-3 text-center">
              {isEditing ? (
                <label className="group relative cursor-pointer rounded-full bg-surface p-1.5 shadow-lg focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
                  <img key={picUrl || "current"} src={avatarSrc} alt="Your profile photo. Select to change it." className={`${avatar} transition-opacity group-hover:opacity-80 st-pop`} />
                  <span className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow ring-2 ring-surface">
                    {ic(cameraIcon, 18, "brightness-0 invert")}
                  </span>
                  <input type="file" accept="image/*" onChange={(e) => setPic(e.target.files[0])} className="sr-only" />
                </label>
              ) : (
                <div className="st-pop rounded-full bg-surface p-1.5 shadow-lg">
                  <img src={avatarSrc} alt="Your profile photo" className={avatar} />
                </div>
              )}

              {isEditing ? (
                <div className="flex min-w-0 flex-col items-center gap-1">
                  <p className="text-2xl font-bold" style={serif}>Edit profile</p>
                  <p className="max-w-full truncate text-[13px] text-text/60">
                    {pic ? `New photo selected: ${pic.name}` : "Tap your photo to change it"}
                  </p>
                  {pic && (
                    <button type="button" onClick={() => setPic(null)} className={`rounded text-[13px] font-medium text-primary underline-offset-4 hover:underline ${focusRing}`}>
                      Undo photo change
                    </button>
                  )}
                </div>
              ) : isDeleting ? null : (
                <div className="flex min-w-0 flex-col items-center gap-2">
                  <p className="text-2xl font-bold" style={serif}>{user.name}</p>
                  <p className="inline-flex max-w-full items-center gap-2 rounded-full bg-bg px-3 py-1.5 text-[13px] text-text/70">
                    <span className="shrink-0 text-primary">{ic(mailIcon, 15)}</span>
                    <span className="truncate">{user.email}</span>
                  </p>
                </div>
              )}
            </div>

            {isEditing ? (
              <div key="edit" className="st-rise flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <FormField label="Name" icon={svg("user")} placeholder="Your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
                  <div className="flex flex-col gap-1">
                    <FormField
                      label="New Password"
                      type={showPw ? "text" : "password"}
                      icon={svg("lock")}
                      placeholder="New password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      right={
                        <button
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          aria-label={showPw ? "Hide password" : "Show password"}
                          className={`rounded-lg p-1.5 hover:bg-surface ${focusRing}`}
                        >
                          <img src={svg(showPw ? "eye-off" : "eye")} alt="" className="h-5 w-5" />
                        </button>
                      }
                    />
                    <p className="text-[13px] text-text/60">Leave blank to keep your current password.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 [&>button]:w-full [&>button:last-child]:bg-primary">
                  <Button variant="secondary" onClick={() => setIsEditing(false)}>Discard</Button>
                  <Button variant="primary" onClick={save} disabled={!changed}>Save changes</Button>
                </div>
              </div>
            ) : isDeleting ? (
              <div key="delete" className="st-rise flex flex-col gap-6">
                <div role="alert" className="flex gap-3 rounded-xl border border-malignant/30 bg-malignant/5 p-4">
                  <span className="mt-0.5 shrink-0 text-malignant">{ic(alertRedIcon, 22)}</span>
                  <div>
                    <p className="text-base font-bold text-malignant">Delete account</p>
                    <p className="mt-1 text-[13px] text-text/75">This action cannot be undone. Enter your password to confirm.</p>
                  </div>
                </div>
                <div className={fields}>
                  <FormField label="Confirm Password" type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
                </div>
                <div className={stack}>
                  <button
                    type="button"
                    onClick={deleteAccount}
                    className={`w-full rounded-md bg-malignant px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90 ${focusRing}`}
                  >
                    Delete account
                  </button>
                  <Button variant="secondary" onClick={() => { setIsDeleting(false); setDeletePassword(""); }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div key="view" className="flex flex-col gap-6">
                {/* action list */}
                <div className="flex flex-col gap-2">
                  {rows.map((r, i) => (
                    <button key={r.title} type="button" onClick={r.onClick} className={`${row} st-rise`} style={{ "--d": `${120 + i * 70}ms` }}>
                      <span className={rowIcon}>{ic(r.icon, 20)}</span>
                      {r.sub ? (
                        <span className="flex-1">
                          <span className="block font-semibold">{r.title}</span>
                          <span className="block text-[13px] text-text/60">{r.sub}</span>
                        </span>
                      ) : (
                        <span className="flex-1 font-semibold">{r.title}</span>
                      )}
                      {chevron}
                    </button>
                  ))}
                </div>

                {/* dark mode switch */}
                <ThemeToggle />

                {/* danger zone, set apart from the everyday actions */}
                <div className="flex flex-col gap-3 border-t border-primary/15 pt-5">
                  <p className="text-[13px] text-text/60">Permanently delete your account and saved scans.</p>
                  <button
                    type="button"
                    onClick={() => setIsDeleting(true)}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-malignant bg-bg px-4 py-3 font-medium text-malignant transition-colors hover:bg-malignant/5 ${focusRing}`}
                  >
                    {ic(trashRedIcon, 18)}
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* right: activity */}
        <section aria-label="Your activity" className="st-rise md:col-span-3" style={{ "--d": "140ms" }}>
          <Card>
            <div className="flex flex-col gap-6 p-2 sm:p-3">
              <div className="flex items-center gap-3">
                <span className={rowIcon}>{ic(pulseIcon, 20)}</span>
                <div>
                  <h2 className="text-2xl font-bold" style={serif}>Your activity</h2>
                  <p className="text-[13px] text-text/60">A snapshot of the scans you've saved.</p>
                </div>
              </div>

              {statsFailed && (
                <p role="alert" className="st-alert rounded-xl border border-malignant/30 bg-malignant/5 p-3 text-[13px] text-malignant">
                  Couldn't load your activity. Try refreshing the page.
                </p>
              )}

              {/* stat tiles */}
              <div className="grid grid-cols-3 gap-3">
                {tiles.map((t, i) => (
                  <div key={t.label} style={{ "--d": `${200 + i * 80}ms` }} className="st-pop flex flex-col gap-3 rounded-2xl bg-bg p-4">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${t.chip}`}>{ic(t.icon, 18)}</span>
                    <div>
                      <p className={`text-3xl font-bold ${t.tone}`} style={serif}>
                        {typeof t.value === "number" ? (
                          <>
                            <span className="sr-only">{t.value}</span>
                            <span aria-hidden="true" className="st-count" style={{ "--to": t.value }} />
                          </>
                        ) : (
                          t.value
                        )}
                      </p>
                      <p className="mt-1 text-[13px] text-text/70">{t.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* benign vs malignant split */}
              {total > 0 && (
                <div className="st-rise rounded-2xl bg-bg p-4" style={{ "--d": "440ms" }}>
                  <div className="mb-3 flex items-baseline justify-between text-[13px] text-text/70">
                    <span>All saved scans</span>
                    <span>{total} total</span>
                  </div>
                  <SplitBar benign={benignCount} malignant={malignantCount} label={`${benignCount} benign and ${malignantCount} malignant out of ${total} scans`} />
                </div>
              )}

              {/* trends: scans per week and where on the body they are */}
              {total > 0 && (
                <div className="st-rise flex flex-col gap-4 rounded-2xl bg-bg p-4" style={{ "--d": "480ms" }}>
                  <TrendsChart
                    data={trends?.weeks ?? []}
                    range={trendWeeks}
                    onRange={setTrendWeeks}
                    loading={!trends && !trendsFailed}
                    failed={trendsFailed}
                  />

                  {(trends?.locations?.length ?? 0) > 0 && (
                    <div className="flex flex-col gap-2 border-t border-primary/15 pt-4">
                      <p className="text-[13px] font-medium text-text/70">Scans by body area</p>
                      <ul className="flex flex-wrap gap-2">
                        {trends.locations.map((a) => (
                          <li key={a.location} className="rounded-full bg-surface px-3 py-1.5 text-[13px]">
                            {locationLabel(a.location)} <span className="font-semibold text-primary">{a.count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* recent scans */}
              <div className="st-rise flex flex-col gap-3 rounded-2xl bg-bg p-4" style={{ "--d": "520ms" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/30 text-primary">{ic(clockIcon, 20)}</span>
                    <p className="text-base font-semibold">Recent scans</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/history")}
                    className={`rounded text-[13px] font-medium text-primary underline-offset-4 hover:underline ${focusRing}`}
                  >
                    View all
                  </button>
                </div>

                {scans.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {scans.map((s, i) => {
                      const malignant = s.prediction === "malignant";
                      const when = new Date(s.created_at);
                      return (
                        <li
                          key={s.id ?? i}
                          className="st-rise flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5"
                          style={{ "--d": `${560 + i * 60}ms` }}
                        >
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${malignant ? "bg-malignant/10" : "bg-benign/15"}`}>
                            {ic(malignant ? alertRedIcon : checkTealIcon, 18)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className={`text-base font-semibold ${malignant ? "text-malignant" : "text-benign"}`}>
                              {malignant ? "Malignant" : "Benign"}
                            </p>
                            <p className="text-[13px] text-text/60">
                              {isNaN(when) ? "" : when.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                              {s.body_location ? ` · ${locationLabel(s.body_location)}` : ""}
                            </p>
                          </div>
                          {!isNaN(when) && <span className="shrink-0 text-[13px] text-text/60">{timeAgo(when)}</span>}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-base font-semibold">{activityLoading ? "Loading..." : "No scans yet"}</p>
                )}
              </div>

              {/* empty state */}
              {!activityLoading && !statsFailed && total === 0 && (
                <div className="flex flex-col gap-3 border-t border-primary/15 pt-5 [&>button]:w-full">
                  <p className="text-base text-text/80">Your results will show up here once you save a scan.</p>
                  <Button variant="primary" onClick={() => navigate("/")}>Scan a lesion</Button>
                </div>
              )}
            </div>
          </Card>
        </section>
      </div>

      <FooterDisclaimer />
    </main>
  );
}