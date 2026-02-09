export default function Topbar() {
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Good morning, Tanya</h2>
        <p className="text-sm text-gray-400">
          Tuesday, {new Date().toLocaleDateString()}
        </p>
      </div>

      <input
        className="border rounded-lg px-4 py-2 text-sm w-64"
        placeholder="Search health records..."
      />
    </div>
  );
}
