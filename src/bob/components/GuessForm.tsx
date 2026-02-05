import { useState } from "react";
import { User, Mail, DollarSign, ArrowLeft, Baby } from "lucide-react";
import { BabyIcon } from "./BabyIcon";
import { AppView, GuessData } from "../App";

interface GuessFormProps {
  onNavigate: (view: AppView) => void;
  onSubmit: (guess: GuessData) => void;
}

// Configuration
const DUE_DATE = new Date("2026-05-22");
const MIN_OFFSET = -14; // May 8, 2026
const MAX_OFFSET = 14; // June 5, 2026
const MIN_CONTRIBUTION = 10;

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const GuessForm = ({ onNavigate, onSubmit }: GuessFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sex, setSex] = useState<"boy" | "girl" | null>(null);
  const [dateOffset, setDateOffset] = useState(0);
  const [amount, setAmount] = useState(MIN_CONTRIBUTION);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedDate = addDays(DUE_DATE, dateOffset);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Please enter your name";
    } else if (name.length > 50) {
      newErrors.name = "Name must be 50 characters or less";
    }

    if (!email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!sex) {
      newErrors.sex = "Please select boy or girl";
    }

    if (amount < MIN_CONTRIBUTION) {
      newErrors.amount = `Minimum contribution is $${MIN_CONTRIBUTION}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !sex) return;

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      sex,
      date: selectedDate,
      contributionAmount: amount,
    });
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <BabyIcon size="md" className="mx-auto" />
          <h1 className="mt-6 font-display text-3xl md:text-4xl font-bold" style={{ color: "var(--bob-text)" }}>
            Make Your Guess
          </h1>
          <p className="mt-2" style={{ color: "var(--bob-text-muted)" }}>
            Fill in your prediction for DJ & Kaz's baby
          </p>
        </div>

        {/* Form Card */}
        <div className="bob-card p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--bob-text)" }}>
                Your Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: "var(--bob-text-muted)" }}
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={50}
                  className="bob-input"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--bob-text)" }}>
                Your Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: "var(--bob-text-muted)" }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bob-input"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Sex Toggle */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: "var(--bob-text)" }}>
                Baby's Sex
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Boy Button */}
                <button
                  type="button"
                  onClick={() => setSex("boy")}
                  className={`
                    relative p-6 rounded-xl border-2 transition-all
                    flex flex-col items-center gap-2
                    ${sex === "boy"
                      ? "border-[var(--bob-boy-blue-border)] bg-[var(--bob-boy-blue)]"
                      : "border-[var(--bob-border)] bg-white hover:border-[var(--bob-boy-blue-border)]"
                    }
                  `}
                >
                  <Baby
                    className="w-10 h-10"
                    strokeWidth={1.5}
                    style={{ color: "var(--bob-boy-blue-text)" }}
                  />
                  <span
                    className="font-medium"
                    style={{ color: "var(--bob-boy-blue-text)" }}
                  >
                    Boy
                  </span>
                </button>

                {/* Girl Button */}
                <button
                  type="button"
                  onClick={() => setSex("girl")}
                  className={`
                    relative p-6 rounded-xl border-2 transition-all
                    flex flex-col items-center gap-2
                    ${sex === "girl"
                      ? "border-[var(--bob-girl-coral-border)] bg-[var(--bob-girl-coral)]"
                      : "border-[var(--bob-border)] bg-white hover:border-[var(--bob-girl-coral-border)]"
                    }
                  `}
                >
                  <Baby
                    className="w-10 h-10"
                    strokeWidth={1.5}
                    style={{ color: "var(--bob-girl-coral-text)" }}
                  />
                  <span
                    className="font-medium"
                    style={{ color: "var(--bob-girl-coral-text)" }}
                  >
                    Girl
                  </span>
                </button>
              </div>
              {errors.sex && (
                <p className="mt-2 text-sm text-red-500">{errors.sex}</p>
              )}
            </div>

            {/* Date Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium" style={{ color: "var(--bob-text)" }}>
                  Birth Date Guess
                </label>
                <span className="text-sm font-medium" style={{ color: "var(--bob-coral)" }}>
                  Due date
                </span>
              </div>

              {/* Custom Slider */}
              <div className="relative pt-2 pb-1">
                <input
                  type="range"
                  min={MIN_OFFSET}
                  max={MAX_OFFSET}
                  value={dateOffset}
                  onChange={(e) => setDateOffset(parseInt(e.target.value))}
                  className="bob-slider w-full"
                  style={{
                    background: `linear-gradient(to right, var(--bob-coral) 0%, var(--bob-coral) ${((dateOffset - MIN_OFFSET) / (MAX_OFFSET - MIN_OFFSET)) * 100}%, var(--bob-boy-blue) ${((dateOffset - MIN_OFFSET) / (MAX_OFFSET - MIN_OFFSET)) * 100}%, var(--bob-boy-blue) 100%)`,
                  }}
                />
              </div>

              {/* Slider Labels */}
              <div className="flex justify-between text-sm mt-2" style={{ color: "var(--bob-text-muted)" }}>
                <span>{MIN_OFFSET} days</span>
                <span className="font-medium" style={{ color: "var(--bob-text)" }}>
                  {formatDate(selectedDate)}
                </span>
                <span>+{MAX_OFFSET} days</span>
              </div>

              {/* Due date reference */}
              <p className="text-center text-sm mt-2" style={{ color: "var(--bob-text-muted)" }}>
                Due date: {formatDate(DUE_DATE)}
              </p>
            </div>

            {/* Contribution Amount */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--bob-text)" }}>
                Contribution Amount
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: "var(--bob-text-muted)" }}
                />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  min={MIN_CONTRIBUTION}
                  className="bob-input"
                />
              </div>
              <p className="mt-1 text-sm" style={{ color: "var(--bob-text-muted)" }}>
                Minimum: ${MIN_CONTRIBUTION}
              </p>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" className="bob-btn bob-btn-primary w-full">
              Complete & Pay
            </button>
          </form>

          {/* Back Link */}
          <button
            onClick={() => onNavigate("home")}
            className="mt-6 w-full flex items-center justify-center gap-2 text-sm"
            style={{ color: "var(--bob-text-muted)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
};
