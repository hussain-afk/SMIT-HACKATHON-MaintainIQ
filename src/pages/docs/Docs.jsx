import React, { useState } from "react";
import {
  Activity,
  ArrowLeftRight,
  Check,
  ChevronRight,
  KeyRound,
  PackagePlus,
  Search,
  ShieldCheck,
  UserCheck,
  Wrench,
} from "lucide-react";

const workflows = [
  { id: "access", label: "Sign in", icon: KeyRound },
  { id: "assets", label: "Find & register", icon: PackagePlus },
  { id: "handover", label: "Handover", icon: ArrowLeftRight },
  { id: "progress", label: "Report progress", icon: Wrench },
];

const steps = {
  access: [
    ["Open MaintainIQ", "Go to the MaintainIQ sign-in screen on your approved work device."],
    ["Sign in securely", "Enter your work email and password, then select Authenticate Security. You may also select Continue with Google Workspace."],
    ["Choose your workspace", "Choose Administrative Terminal to manage equipment, or Public Portal View (Technician) to work on assets in the field."],
    ["Finish your session", "Use Sign Out in the dashboard header before leaving a shared computer or tablet."],
  ],
  assets: [
    ["Search before you act", "Use the dashboard search box to look up an asset by its name, serial number, or category. A serial number gives the quickest exact match."],
    ["Register equipment", "In the Administrative Terminal, select Add Asset."],
    ["Add the essentials", "Enter Asset Name and Serial Number, then choose Machinery, Facilities, Fleet, or IT. Add a description when it will help the next operator."],
    ["Save and verify", "Save the form. The new asset appears in the registry with an Active status."],
  ],
  handover: [
    ["Open the asset", "From the technician dashboard, open the correct asset card or its QR-linked detail page."],
    ["Request the handover", "In Request Handover, enter your name, estimated work time, and clear notes about the issue or required work."],
    ["Send for review", "Select Send Handover Request. The asset changes to Pending Approval while the administrator reviews it."],
    ["Administrator decides", "The administrator checks the request details and selects Approve Handover or Reject."],
  ],
  progress: [
    ["Wait for approval", "The Report Progress area is locked until an administrator approves the handover."],
    ["Open Report Progress", "Once approved, return to the asset detail page and select 2. Report Progress."],
    ["Choose the current status", "Set the asset to Active, Under Maintenance, or Inactive, then add an accurate technician note."],
    ["Submit the update", "Save the report so the newest condition and note appear on the asset record."],
  ],
};

function Docs() {
  const [active, setActive] = useState("access");
  const selected = workflows.find((workflow) => workflow.id === active);
  const ActiveIcon = selected.icon;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050b16] px-3 py-4 text-slate-100 sm:px-6 sm:py-8 lg:px-10 lg:py-12">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(76,201,240,0.15),transparent_30%),radial-gradient(circle_at_90%_15%,rgba(67,97,238,0.14),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.08),transparent_38%)]" />
      <div className="relative mx-auto max-w-6xl">
        <header className="overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/55 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl sm:rounded-3xl sm:p-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 max-w-3xl">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400"><Activity size={14} /> MaintainIQ field handbook</div>
              <h1 className="mt-3 break-words text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">User Guide & Workflows</h1>
              <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">Everything a technician or operator needs to safely find equipment, request maintenance handover, and keep asset status up to date.</p>
            </div>
            <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300"><span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-400" /> Ready for field use</div>
          </div>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <nav className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/45 p-2 backdrop-blur-xl lg:h-fit" aria-label="User guide workflows">
            <p className="px-3 pb-2 pt-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Choose a workflow</p>
            <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] lg:flex-col lg:overflow-visible">
              {workflows.map(({ id, label, icon: Icon }, index) => (
                <button key={id} type="button" onClick={() => setActive(id)} className={`flex min-h-11 shrink-0 snap-start items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold transition ${active === id ? "border border-cyan-400/25 bg-cyan-400/10 text-cyan-100 shadow-[inset_0_0_20px_rgba(76,201,240,0.05)]" : "border border-transparent text-slate-500 hover:bg-slate-800/70 hover:text-slate-200"}`}>
                  <span className={`grid h-7 w-7 place-items-center rounded-lg ${active === id ? "bg-cyan-400/15 text-cyan-300" : "bg-slate-800 text-slate-500"}`}>{index + 1}</span>
                  <Icon size={16} />
                  {label}
                  {active === id && <ChevronRight size={14} className="ml-auto" />}
                </button>
              ))}
            </div>
          </nav>

          <div className="min-w-0 rounded-2xl border border-slate-700/70 bg-slate-900/45 p-4 shadow-xl shadow-black/15 backdrop-blur-xl sm:rounded-3xl sm:p-7">
            <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300"><ActiveIcon size={22} /></div>
              <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Workflow {workflows.findIndex((workflow) => workflow.id === active) + 1}</p><h2 className="mt-1 break-words text-xl font-black text-white sm:text-2xl">{selected.label}</h2></div>
            </div>

            <ol className="mt-6 grid gap-3 sm:gap-4">
              {steps[active].map(([title, description], index) => (
                <li key={title} className="flex min-w-0 gap-3 rounded-2xl border border-slate-800 bg-[#07101f]/65 p-4 sm:gap-5 sm:p-5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 font-mono text-xs font-black text-cyan-300">{index + 1}</span>
                  <div className="min-w-0"><h3 className="break-words text-sm font-bold text-slate-100">{title}</h3><p className="mt-1.5 break-words text-xs leading-5 text-slate-400 sm:text-sm">{description}</p></div>
                </li>
              ))}
            </ol>

            {active === "access" && <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-xs leading-5 text-amber-100/90"><ShieldCheck size={15} className="mr-2 inline text-amber-300" /><strong>Security note:</strong> never share your password. If you cannot sign in, contact your organisation’s app administrator; the current app does not include a password-reset screen.</div>}
            {active === "assets" && <div className="mt-5 rounded-xl border border-indigo-400/20 bg-indigo-400/10 p-4 text-xs leading-5 text-indigo-100/90"><Search size={15} className="mr-2 inline text-indigo-300" /><strong>Fast lookup:</strong> search filters as you type. Use a serial number during an incident when you need an exact result quickly.</div>}
            {active === "handover" && <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-xs leading-5 text-amber-100/90"><UserCheck size={15} className="mr-2 inline text-amber-300" /><strong>Current handover setup:</strong> the form records the requesting technician, estimated time, and notes. It does not yet include a separate receiving-operator field; an administrator reviews the request.</div>}
            {active === "progress" && <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs text-emerald-100"><strong>Active</strong><br /><span className="text-emerald-100/75">Available for normal use.</span></div><div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-100"><strong>Under Maintenance</strong><br /><span className="text-amber-100/75">Work is currently in progress.</span></div><div className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-xs text-rose-100"><strong>Inactive</strong><br /><span className="text-rose-100/75">Unavailable or needs attention.</span></div></div>}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-6">
          <h2 className="text-sm font-black text-slate-100">Handover status at a glance</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3"><div className="rounded-xl border border-indigo-400/20 bg-indigo-400/10 p-4 text-xs leading-5 text-indigo-100"><strong>Pending Approval</strong><br /><span className="text-indigo-100/75">An administrator is reviewing the request. Progress reporting stays locked.</span></div><div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-xs leading-5 text-amber-100"><strong>Approved</strong><br /><span className="text-amber-100/75">The asset becomes Under Maintenance and progress reporting unlocks.</span></div><div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-xs leading-5 text-emerald-100"><strong>Rejected</strong><br /><span className="text-emerald-100/75">The asset returns to Active and the pending request is removed.</span></div></div>
        </section>
      </div>
    </main>
  );
}

export default Docs;
