export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow text-center">
        
        <h1 className="text-2xl font-semibold mb-6">
          Welcome to Stak
        </h1>

        <div className="flex gap-4 justify-center mt-4">
          <a href="/login" className="px-5 py-2 rounded border border-black text-black hover:bg-gray-100 transition">
            Login
          </a>
          <a href="/signup" className="px-5 py-2 rounded bg-black text-white hover:bg-gray-800 transition">
            Sign up
          </a>
        </div>

      </div>
    </div>
  );
}