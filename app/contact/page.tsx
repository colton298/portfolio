export const metadata = {
  title: "Colton Santiago - Contact",
};

export default function Contact() {
  return (
    <main className="min-h-screen px-4 pt-14">
      <section className="mx-auto w-full max-w-5xl space-y-8 pb-12">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-semibold">Contact</h1>
          <p className="mx-auto max-w-2xl text-sm leading-6 text-white/65">
            Send a bug report, suggestion, or other message.
          </p>
        </div>

        <form
          action="https://formspree.io/f/mqejkayq"
          method="POST"
          className="mx-auto max-w-2xl space-y-6 rounded-lg border border-white/10 bg-white/[0.03] p-6"
        >
          <input
            type="hidden"
            name="_subject"
            value="Portfolio website contact form"
          />

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-white/15 bg-[#181818] px-3 py-2 text-white outline-none transition focus:border-white/45"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message-type" className="block text-sm font-semibold">
              Message type
            </label>
            <select
              id="message-type"
              name="messageType"
              required
              defaultValue=""
              className="w-full rounded-md border border-white/15 bg-[#181818] px-3 py-2 text-white outline-none transition focus:border-white/45"
            >
              <option value="" disabled>
                Select a type
              </option>
              <option value="Bug">Bug</option>
              <option value="Suggestion">Suggestion</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="block text-sm font-semibold">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={7}
              className="w-full resize-y rounded-md border border-white/15 bg-[#181818] px-3 py-2 text-white outline-none transition focus:border-white/45"
            />
          </div>

          <button
            type="submit"
            className="rounded-md bg-white px-5 py-2 font-semibold text-[#121212] transition hover:bg-white/85"
          >
            Send message
          </button>
        </form>
      </section>
    </main>
  );
}
