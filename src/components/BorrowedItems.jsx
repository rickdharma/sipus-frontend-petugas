function BorrowedItems({ items }) {
  if (!items?.length) return <span className="text-slate-400">-</span>;

  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <li key={item.id}>
          {/* Buku yang sudah dihapus (soft delete) bisa saja tidak ikut terkirim */}
          <span className="font-medium">{item.book?.title ?? `Buku #${item.book_id}`}</span>{" "}
          <span className="text-slate-500">× {item.quantity}</span>
        </li>
      ))}
    </ul>
  );
}

export default BorrowedItems;