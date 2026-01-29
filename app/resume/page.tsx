export const metadata = {
  title: "Colton Santiago - Resume",
};

export default function ResumePage() {
  return (
    <main className="min-h-screen flex flex-col items-center p-6">
      <iframe
        src="/assets/Resume.pdf"
        className="w-full max-w-5xl h-[90vh] border rounded"
      />

      <div className="mt-4 flex gap-4">
        <a
          href="/assets/Resume.pdf"
          download
          className="px-4 py-2 bg-gray-800 text-white rounded"
        >
          Download PDF
        </a>

        <a
          href="/assets/Resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-gray-800 text-white rounded"
        >
          Open in new tab
        </a>
      </div>
    </main>
  );
}
