type RevenuePoint = {
  label: string;
  value: number;
};

type StatusPoint = {
  label: string;
  value: number;
  colorClass: string;
};

type OverviewChartsProps = {
  revenuePoints: RevenuePoint[];
  statusPoints: StatusPoint[];
};

export function OverviewCharts({
  revenuePoints,
  statusPoints,
}: OverviewChartsProps) {
  const maxValue = Math.max(...revenuePoints.map((point) => point.value), 1);
  const chartWidth = 560;
  const chartHeight = 180;
  const horizontalPadding = 22;

  const points = revenuePoints
    .map((point, index) => {
      const x =
        horizontalPadding +
        (index * (chartWidth - horizontalPadding * 2)) /
          Math.max(revenuePoints.length - 1, 1);
      const y =
        chartHeight - 20 - (point.value / maxValue) * (chartHeight - 52);
      return `${x},${y}`;
    })
    .join(" ");

  const totalStatuses = statusPoints.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <article className="rounded-3xl border border-border/70 bg-white p-5 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-2xl font-semibold text-foreground">
              Revenue trend
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Last 6 months based on real invoices.
            </p>
          </div>
        </div>

        {revenuePoints.some((point) => point.value > 0) ? (
          <div className="mt-5 overflow-x-auto">
            <svg
              width={chartWidth}
              height={chartHeight}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full min-w-130"
              aria-label="Revenue trend chart"
            >
              <rect
                x="0"
                y="0"
                width={chartWidth}
                height={chartHeight}
                fill="transparent"
              />
              <line
                x1="22"
                y1={chartHeight - 20}
                x2={chartWidth - 22}
                y2={chartHeight - 20}
                stroke="rgba(16,54,29,0.15)"
              />
              <polyline
                fill="none"
                stroke="#00a651"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
              {revenuePoints.map((point, index) => {
                const x =
                  horizontalPadding +
                  (index * (chartWidth - horizontalPadding * 2)) /
                    Math.max(revenuePoints.length - 1, 1);
                const y =
                  chartHeight -
                  20 -
                  (point.value / maxValue) * (chartHeight - 52);
                return (
                  <g key={point.label}>
                    <circle cx={x} cy={y} r="4" fill="#00a651" />
                    <text
                      x={x}
                      y={chartHeight - 4}
                      textAnchor="middle"
                      fill="rgba(63,106,75,1)"
                      fontSize="11"
                    >
                      {point.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-muted/60 px-4 py-6 text-center text-sm text-muted-foreground">
            No revenue data available yet.
          </p>
        )}
      </article>

      <article className="rounded-3xl border border-border/70 bg-white p-5 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-6">
        <h3 className="text-2xl font-semibold text-foreground">
          Invoice status mix
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Current distribution by status.
        </p>

        <div className="mt-5 space-y-3">
          {statusPoints.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-semibold text-foreground">
                  {item.value}
                </span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full ${item.colorClass}`}
                  style={{
                    width: `${
                      totalStatuses > 0
                        ? Math.max(
                            (item.value / totalStatuses) * 100,
                            item.value > 0 ? 5 : 0,
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
