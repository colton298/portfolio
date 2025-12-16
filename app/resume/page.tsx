//Resume page
export const metadata = 
{
  title: "Resume | Colton Santiago",
};

export default function Resume() 
{
  return (
    <main className="relative flex flex-col min-h-screen">
      
      {/*Resume Embed*/}
      <iframe
        src="/assets/resume.pdf"
        title="Colton Santiago Resume"
        className="flex-1 w-full border-0 bg-white"
      />

      {/*Resume Actions*/}
      <div className="fixed left-1/2 -translate-x-1/2 bottom-4 z-20 flex flex-col gap-2 rounded-lg border border-white/10 bg-black/60 backdrop-blur px-4 py-2">
        <a
          href="/assets/resume.pdf"
          download
          className="text-sm text-center hover:text-white"
        >
          Download PDF
        </a>
        <a
          href="/assets/resume.pdf"
          target="_blank"
          className="text-sm text-center hover:text-white"
        >
          Open in new tab
        </a>
      </div>
    </main>
  );
}
