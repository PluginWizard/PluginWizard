export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0b0b0d] px-4 py-24 text-center text-white">
      <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
        404 - Page Not Found
      </h1>
      <p className="mt-4 max-w-xl text-lg text-card-muted-foreground">
        We couldn't find what you were looking for.
      </p>

      <video
        src="/videos/steve-404.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="mt-10 w-full max-w-md rounded-lg"
      />
    </main>
  )
}
