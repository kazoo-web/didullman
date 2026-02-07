import { useState } from "react";
import { Baby, Calendar, Users, DollarSign, Clock } from "lucide-react";
import { GuessRecord, TimeOfDay } from "../lib/guessService";

const TIME_OF_DAY_CONFIG: { value: TimeOfDay; label: string; range: string }[] = [
  { value: "overnight", label: "Overnight", range: "12am-6am" },
  { value: "morning", label: "Morning", range: "6am-12pm" },
  { value: "afternoon", label: "Afternoon", range: "12pm-6pm" },
  { value: "evening", label: "Evening", range: "6pm-12am" },
];

interface GuessingStatsProps {
  guesses: GuessRecord[];
}

const formatShortDate = (dateStr: string): string => {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Compact format for x-axis labels (M/D format)
const formatAxisDate = (dateStr: string): string => {
  const date = new Date(dateStr + "T12:00:00");
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

// Generate dates between min and max (inclusive)
const generateDateRange = (minDate: string, maxDate: string): string[] => {
  const dates: string[] = [];
  const start = new Date(minDate + "T12:00:00");
  const end = new Date(maxDate + "T12:00:00");

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
};

export const GuessingStats = ({ guesses }: GuessingStatsProps) => {
  const [hoveredSegment, setHoveredSegment] = useState<"boy" | "girl" | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [hoveredTime, setHoveredTime] = useState<TimeOfDay | null>(null);

  // Calculate sex stats
  const boyCount = guesses.filter((g) => g.sex === "boy").length;
  const girlCount = guesses.filter((g) => g.sex === "girl").length;
  const total = guesses.length;
  const boyPercent = total > 0 ? Math.round((boyCount / total) * 100) : 0;
  const girlPercent = total > 0 ? 100 - boyPercent : 0; // Ensure they sum to 100%

  // Calculate total fund
  const totalFund = guesses.reduce((sum, g) => sum + g.contribution_amount, 0);

  // Calculate date distribution - only dates with guesses
  const guessDates = guesses.map((g) => g.guess_date).sort();
  const minGuessDate = guessDates.length > 0 ? guessDates[0] : "2026-05-22";
  const maxGuessDate = guessDates.length > 0 ? guessDates[guessDates.length - 1] : "2026-05-22";

  const displayDates = generateDateRange(minGuessDate, maxGuessDate);
  const dateCounts: Record<string, number> = {};
  displayDates.forEach((d) => (dateCounts[d] = 0));
  guesses.forEach((g) => {
    if (dateCounts[g.guess_date] !== undefined) {
      dateCounts[g.guess_date]++;
    }
  });
  const maxDateCount = Math.max(...Object.values(dateCounts), 1);

  // Generate Y-axis labels (integers only, from max down to 0)
  const yAxisLabels: number[] = [];
  for (let i = maxDateCount; i >= 0; i--) {
    yAxisLabels.push(i);
  }

  // Calculate time of day distribution
  const timeCounts: Record<TimeOfDay, number> = {
    overnight: 0,
    morning: 0,
    afternoon: 0,
    evening: 0,
  };
  guesses.forEach((g) => {
    if (g.time_of_day && timeCounts[g.time_of_day] !== undefined) {
      timeCounts[g.time_of_day]++;
    }
  });
  const maxTimeCount = Math.max(...Object.values(timeCounts), 1);

  // Donut chart calculations
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate arc paths for donut segments
  const polarToCartesian = (angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  };

  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(endAngle);
    const end = polarToCartesian(startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  const boyAngle = (boyPercent / 100) * 360;
  const girlAngle = (girlPercent / 100) * 360;

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
          <div className="relative flex-shrink-0">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {/* Boy segment (blue) - starts from top (0°) */}
              {boyPercent > 0 && (
                <path
                  d={describeArc(0, boyAngle)}
                  fill="none"
                  stroke={hoveredSegment === "boy" ? "#60a5fa" : "#93c5fd"}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  style={{ cursor: "pointer", transition: "stroke 0.2s" }}
                  onMouseEnter={() => setHoveredSegment("boy")}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              )}
              {/* Girl segment (coral) - starts where boy ends */}
              {girlPercent > 0 && (
                <path
                  d={describeArc(boyAngle, boyAngle + girlAngle)}
                  fill="none"
                  stroke={hoveredSegment === "girl" ? "#d4694a" : "#e8805c"}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  style={{ cursor: "pointer", transition: "stroke 0.2s" }}
                  onMouseEnter={() => setHoveredSegment("girl")}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              )}
            </svg>

            {/* Center labels */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {hoveredSegment ? (
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: hoveredSegment === "boy" ? "#3b82f6" : "#e8805c" }}>
                    {hoveredSegment === "boy" ? boyPercent : girlPercent}%
                  </div>
                  <div className="text-sm capitalize" style={{ color: "var(--bob-text-muted)" }}>
                    {hoveredSegment === "boy" ? boyCount : girlCount} {(hoveredSegment === "boy" ? boyCount : girlCount) === 1 ? "vote" : "votes"}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-lg font-medium" style={{ color: "var(--bob-text)" }}>{total}</div>
                  <div className="text-xs" style={{ color: "var(--bob-text-muted)" }}>total</div>
                </div>
              )}
            </div>
          </div>

          {/* Vote Cards */}
          <div className="flex flex-1 gap-3 w-full">
            {/* Boy Card */}
            <div
              className="flex-1 p-4 rounded-xl cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: "var(--bob-boy-blue)" }}
              onMouseEnter={() => setHoveredSegment("boy")}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Baby className="w-5 h-5" style={{ color: "var(--bob-boy-blue-text)" }} />
                  <span className="font-medium" style={{ color: "var(--bob-boy-blue-text)" }}>Boy</span>
                </div>
                <span className="text-2xl font-bold" style={{ color: "var(--bob-boy-blue-text)" }}>
                  {boyPercent}%
                </span>
              </div>
              <p className="text-sm mt-1" style={{ color: "var(--bob-boy-blue-text)", opacity: 0.8 }}>
                {boyCount} {boyCount === 1 ? "vote" : "votes"}
              </p>
            </div>

            {/* Girl Card */}
            <div
              className="flex-1 p-4 rounded-xl cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: "var(--bob-girl-coral)" }}
              onMouseEnter={() => setHoveredSegment("girl")}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Baby className="w-5 h-5" style={{ color: "var(--bob-girl-coral-text)" }} />
                  <span className="font-medium" style={{ color: "var(--bob-girl-coral-text)" }}>Girl</span>
                </div>
                <span className="text-2xl font-bold" style={{ color: "var(--bob-girl-coral-text)" }}>
                  {girlPercent}%
                </span>
              </div>
              <p className="text-sm mt-1" style={{ color: "var(--bob-girl-coral-text)", opacity: 0.8 }}>
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
            What date will B.U.D. arrive?
          </span>
        </div>

        {/* Horizontal Bar Chart */}
        <div className="space-y-2">
          {displayDates.map((date) => {
            const count = dateCounts[date];
            const widthPercent = (count / maxDateCount) * 100;
            const isHovered = hoveredDate === date;

            return (
              <div
                key={date}
                className="flex items-center gap-3 cursor-pointer"
                onMouseEnter={() => setHoveredDate(date)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                {/* Date label */}
                <div
                  className="text-sm w-12 text-right flex-shrink-0"
                  style={{ color: isHovered ? "var(--bob-coral)" : "var(--bob-text-muted)" }}
                >
                  {formatAxisDate(date)}
                </div>

                {/* Bar container */}
                <div
                  className="flex-1 h-6 rounded-lg overflow-hidden"
                  style={{ backgroundColor: "var(--bob-border)" }}
                >
                  {count > 0 && (
                    <div
                      className="h-full rounded-lg transition-all"
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: isHovered ? "#d4694a" : "#e8805c",
                        minWidth: "8px",
                      }}
                    />
                  )}
                </div>

                {/* Count label */}
                <div
                  className="text-sm w-8 flex-shrink-0"
                  style={{ color: isHovered ? "var(--bob-coral)" : "var(--bob-text-muted)" }}
                >
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time of Day Distribution Card */}
      <div className="bob-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5" style={{ color: "var(--bob-coral)" }} />
          <span className="font-medium" style={{ color: "var(--bob-text)" }}>
            What time will B.U.D. arrive?
          </span>
        </div>

        <div className="space-y-3">
          {TIME_OF_DAY_CONFIG.map((timeOption) => {
            const count = timeCounts[timeOption.value];
            const percent = total > 0 ? (count / total) * 100 : 0;
            const isHovered = hoveredTime === timeOption.value;

            return (
              <div
                key={timeOption.value}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredTime(timeOption.value)}
                onMouseLeave={() => setHoveredTime(null)}
              >
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: "var(--bob-text)" }}>
                    {timeOption.label}{" "}
                    <span style={{ color: "var(--bob-text-muted)" }}>({timeOption.range})</span>
                  </span>
                  <span style={{ color: isHovered ? "var(--bob-coral)" : "var(--bob-text-muted)" }}>
                    {count} {count === 1 ? "guess" : "guesses"}
                  </span>
                </div>
                <div
                  className="h-6 rounded-lg overflow-hidden"
                  style={{ backgroundColor: "var(--bob-border)" }}
                >
                  <div
                    className="h-full rounded-lg transition-all"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: isHovered ? "#d4694a" : "#e8805c",
                      minWidth: count > 0 ? "8px" : "0",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Participants Card */}
        <div className="bob-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--bob-girl-coral)" }}
            >
              <Users className="w-5 h-5" style={{ color: "var(--bob-girl-coral-text)" }} />
            </div>
            <span style={{ color: "var(--bob-text-muted)" }}>Participants</span>
          </div>
          <p className="text-4xl font-bold" style={{ color: "var(--bob-text)" }}>
            {total}
          </p>
        </div>

        {/* Baby Fund Card */}
        <div className="bob-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--bob-girl-coral)" }}
            >
              <DollarSign className="w-5 h-5" style={{ color: "var(--bob-girl-coral-text)" }} />
            </div>
            <span style={{ color: "var(--bob-text-muted)" }}>Baby Fund</span>
          </div>
          <p className="text-4xl font-bold" style={{ color: "var(--bob-text)" }}>
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
