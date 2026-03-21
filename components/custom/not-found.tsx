type NotFoundProps = {
  status?: number;
  message?: string;
  description?: string;
};

export function NotFound({
  status = 400,
  message = "Not Found",
  description = "The requested resource was not found on this server.",
}: NotFoundProps) {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <svg
        className="mb-4 h-24 w-24"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--secondary)" />
          </linearGradient>
        </defs>
        <circle
          cx="100"
          cy="100"
          r="56"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="8"
          opacity="0.5"
        />
        <path
          d="M100 44a56 56 0 1 1 0 112 56 56 0 0 1 0-112Z"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="10"
          strokeDasharray="20 140"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 100 100"
            to="360 100 100"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>
        <circle cx="100" cy="100" r="30" fill="var(--background)" />
        <text
          x="100"
          y="108"
          textAnchor="middle"
          fontSize="26"
          fill="var(--text)"
          fontWeight="700"
        >
          {status}
        </text>
      </svg>

      <p className="text-6xl font-bold text-primary">{status}</p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">{message}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <a
        href="/"
        className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/80"
      >
        Go back home
      </a>
    </section>
  );
}
