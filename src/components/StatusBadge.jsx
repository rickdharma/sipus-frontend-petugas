const styles = {
  PENDING: {
    badge: "bg-amber-50 text-amber-800 border-amber-200/80",
    dot: "bg-amber-500 animate-pulse",
  },
  APPROVED: {
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    dot: "bg-indigo-500",
  },
  BORROWED: {
    badge: "bg-sky-50 text-sky-800 border-sky-200/80",
    dot: "bg-sky-500",
  },
  RETURNED: {
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    badge: "bg-rose-50 text-rose-800 border-rose-200/80",
    dot: "bg-rose-500",
  },
};

function StatusBadge({ status }) {
  const conf = styles[status] || {
    badge: "bg-slate-50 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border shadow-2xs whitespace-nowrap ${conf.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${conf.dot}`} />
      <span>{status}</span>
    </span>
  );
}

export default StatusBadge;