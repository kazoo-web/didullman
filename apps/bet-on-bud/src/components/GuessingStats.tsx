import { Baby, Calendar, Users, DollarSign } from "lucide-react";
import { GuessRecord } from "../lib/guessService";

interface GuessingStatsProps {
  guesses: GuessRecord[];
}

// Generate all dates in the range May 8 - June 5
const generateDateRange = () => {
  const dates: string[] = [];
  const start = new Date("2026-05-08");
  const end = new Date("2026-06-05");

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
};

const formatShortDate = (dateStr: string): string => {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const GuessingStats = ({ guesses }: GuessingStatsProps) => {
  // Calculate sex stats
  const boyCount = guesses.filter((g) => g.sex === "boy").length;
  const girlCount = guesses.filter((g) => g.sex === "girl").length;
  const total = guesses.length;
  const boyPercent = total > 0 ? Math.round((boyCount / total) * 100) : 0;
  const girlPercent = total > 0 ? Math.round((girlCount / total) * 100) : 0;

  // Calculate total fund
  const totalFund = guesses.reduce((sum, g) => sum + g.contribution_amount, 0);

  // Calculate date distribution
  const allDates = generateDateRange();
  const dateCounts: Record<string, number> = {};
  allDates.forEach((d) => (dateCounts[d] = 0));
  guesses.forEach((g) => {
    if (dateCounts[g.guess_date] !== undefined) {
      dateCounts[g.guess_date]++;
    }
  });
  const maxDateCount = Math.max(...Object.values(dateCounts), 1);

  // Calculate donut chart segments
  const radius = 60;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  const boyArc = (boyPercent / 100) * circumference;
  const girlArc = (girlPercent / 100) * circumference;

  return (
    <div className="space-y-4">
      <h2
        className="font-display text-2xl md:text-3xl font-bold text-center"
        style={{ color: "var(--bob-text)" }}
      >
        The Stats
      </h2>

      {/* Sex Distribution Card */}
      <div className="bob-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Baby className="w-5 h-5" style={{ color: "var(--bob-coral)" }} />
          <span className="font-medium" style={{ color: "var(--bob-text)" }}>
            What will B.U.D.'s sex be?
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Donut Chart */}
          <div className="relative">
            <svg width="160" height="160" viewBox="0 0 160 160">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={strokeWidth}
              />
              {/* Boy segment (blue) - starts from top */}
              {boyPercent > 0 && (
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${boyArc} ${circumference}`}
                  strokeDashoffset={circumference / 4}
                  strokeLinecap="butt"
                />
              )}
              {/* Girl segment (coral) - starts after boy */}
              {girlPercent > 0 && (
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke="#e8805c"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${girlArc} ${circumference}`}
                  strokeDashoffset={circumference / 4 - boyArc}
                  strokeLinecap="butt"
                />
              )}
              {/* Boy percentage label */}
              {boyPercent > 0 && (
                <text
                  x="80"
                  y="35"
                  textAnchor="middle"
                  className="text-sm font-medium"
                  fill="#3b82f6"
                >
                  {boyPercent}%
                </text>
              )}
              {/* Girl percentage label */}
              {girlPercent > 0 && (
                <text
                  x="80"
                  y="135"
                  textAnchor="middle"
                  className="text-sm font-medium"
                  fill="#e8805c"
                >
                  {girlPercent}%
                </text>
              )}
            </svg>
          </div>

          {/* Vote Cards */}
          <div className="flex flex-1 gap-3 w-full">
            {/* Boy Card */}
            <div
              className="flex-1 p-4 rounded-xl"
              style={{ backgroundColor: "var(--bob-boy-blue)" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Baby
                    className="w-5 h-5"
                    style={{ color: "var(--bob-boy-blue-text)" }}
                  />
                  <span
                    className="font-medium"
                    style={{ color: "var(--bob-boy-blue-text)" }}
                  >
                    Boy
                  </span>
                </div>
                <span
                  className="text-2xl font-bold"
                  style={{ color: "var(--bob-boy-blue-text)" }}
                >
                  {boyPercent}%
                </span>
              </div>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--bob-boy-blue-text)", opacity: 0.8 }}
              >
                {boyCount} {boyCount === 1 ? "vote" : "votes"}
              </p>
            </div>

            {/* Girl Card */}
            <div
              className="flex-1 p-4 rounded-xl"
              style={{ backgroundColor: "var(--bob-girl-coral)" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Baby
                    className="w-5 h-5"
                    style={{ color: "var(--bob-girl-coral-text)" }}
                  />
                  <span
                    className="font-medium"
                    style={{ color: "var(--bob-girl-coral-text)" }}
                  >
                    Girl
                  </span>
                </div>
                <span
                  className="text-2xl font-bold"
                  style={{ color: "var(--bob-girl-coral-text)" }}
                >
                  {girlPercent}%
                </span>
              </div>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--bob-girl-coral-text)", opacity: 0.8 }}
              >
                {girlCount} {girlCount === 1 ? "vote" : "votes"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Distribution Card */}
      <div className="bob-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5" style={{ color: "var(--bob-coral)" }} />
          <span className="font-medium" style={{ color: "var(--bob-text)" }}>
            When will B.U.D. arrive?
          </span>
        </div>

        {/* Bar Chart */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Y-axis labels and bars */}
            <div className="flex">
              {/* Y-axis */}
              <div className="flex flex-col justify-between text-xs pr-2 h-32" style={{ color: "var(--bob-text-muted)" }}>
                <span>{Math.ceil(maxDateCount)}</span>
                <span>{Math.ceil(maxDateCount * 0.75)}</span>
                <span>{Math.ceil(maxDateCount * 0.5)}</span>
                <span>{Math.ceil(maxDateCount * 0.25)}</span>
                <span>0</span>
              </div>

              {/* Bars */}
              <div className="flex-1 flex items-end gap-1 h-32 border-b border-l" style={{ borderColor: "var(--bob-border)" }}>
                {allDates.map((date) => {
                  const count = dateCounts[date];
                  const height = count > 0 ? (count / maxDateCount) * 100 : 0;
                  return (
                    <div
                      key={date}
                      className="flex-1 flex flex-col items-center justify-end"
                    >
                      <div
                        className="w-full max-w-[20px] rounded-t transition-all"
                        style={{
                          height: `${Math.max(height, count > 0 ? 8 : 0)}%`,
                          backgroundColor: count > 0 ? "#e8805c" : "transparent",
                          minHeight: count > 0 ? "8px" : "0",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X-axis labels */}
            <div className="flex mt-1 ml-6">
              {allDates.map((date, i) => (
                <div
                  key={date}
                  className="flex-1 text-center"
                  style={{ color: "var(--bob-text-muted)" }}
                >
                  {i % 3 === 0 && (
                    <span className="text-xs">{formatShortDate(date)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Betters Card */}
        <div className="bob-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--bob-girl-coral)" }}
            >
              <Users className="w-5 h-5" style={{ color: "var(--bob-girl-coral-text)" }} />
            </div>
            <span style={{ color: "var(--bob-text-muted)" }}>Betters</span>
          </div>
          <p
            className="text-4xl font-bold"
            style={{ color: "var(--bob-text)" }}
          >
            {total}
          </p>
        </div>

        {/* Baby Fund Card */}
        <div className="bob-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--bob-gold)", opacity: 0.3 }}
            >
              <DollarSign className="w-5 h-5" style={{ color: "var(--bob-gold)" }} />
            </div>
            <span style={{ color: "var(--bob-text-muted)" }}>Baby Fund</span>
          </div>
          <p
            className="text-4xl font-bold"
            style={{ color: "var(--bob-text)" }}
          >
            ${totalFund}
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--bob-text-muted)" }}>
            for the little one
          </p>
        </div>
      </div>
    </div>
  );
};
