const styles = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  BORROWED: "bg-green-100 text-green-800",
  RETURNED: "bg-gray-200 text-gray-700",
};

function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[status] || "bg-gray-100"}`}>
      {status}
    </span>
  );
}

export default StatusBadge;