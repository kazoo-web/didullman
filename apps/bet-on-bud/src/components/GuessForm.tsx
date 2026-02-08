import { useState, useEffect, useCallback } from "react";
import { User, Mail, DollarSign, ArrowLeft, Baby, MessageSquare, Loader2, Clock } from "lucide-react";
import { BabyIcon } from "./BabyIcon";
import { AppView, GuessData } from "../App";
import { TimeOfDay } from "../lib/guessService";

// Key for storing form data in localStorage
const FORM_DATA_KEY = "pendingGuessFormData";

const TIME_OF_DAY_OPTIONS: { value: TimeOfDay; label: string; range: string }[] = [
  { value: "overnight", label: "Overnight", range: "12:00 AM - 5:59 AM" },
  { value: "morning", label: "Morning", range: "6:00 AM - 11:59 AM" },
  { value: "afternoon", label: "Afternoon", range: "12:00 PM - 5:59 PM" },
  { value: "evening", label: "Evening", range: "6:00 PM - 11:59 PM" },
];

interface GuessFormProps {
  onNavigate: (view: AppView) => void;
  onSubmit: (guess: GuessData) => void;
  isSubmitting: boolean;
  submitError: string | null;
}

// Configuration - use T12:00:00 to avoid timezone issues
const DUE_DATE = new Date("2026-05-22T12:00:00");
const MIN_OFFSET = -14; // May 8, 2026
const MAX_OFFSET = 14; // June 5, 2026
const MIN_CONTRIBUTION = 10;

// Pre-calculate the min and max dates
const MIN_DATE = new Date("2026-05-08T12:00:00");
const MAX_DATE = new Date("2026-06-05T12:00:00");

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatShortDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const GuessForm = ({ onNavigate, onSubmit, isSubmitting, submitError }: GuessFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sex, setSex] = useState<"boy" | "girl" | null>(null);
  const [dateOffset, setDateOffset] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("morning");
  const [amount, setAmount] = useState(MIN_CONTRIBUTION);
  const [advice, setAdvice] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Function to load saved form data from localStorage
  const loadSavedFormData = useCallback(() => {
    const savedData = localStorage.getItem(FORM_DATA_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.name) setName(data.name);
        if (data.email) setEmail(data.email);
        if (data.sex) setSex(data.sex);
        if (data.dateOffset !== undefined) setDateOffset(data.dateOffset);
        if (data.timeOfDay) setTimeOfDay(data.timeOfDay);
        if (data.amount) setAmount(data.amount);
        if (data.advice) setAdvice(data.advice);
        // Clear after loading
        localStorage.removeItem(FORM_DATA_KEY);
      } catch (e) {
        console.error("Failed to parse saved form data", e);
      }
    }
  }, []);

  // Load saved form data on mount and when returning via back button (bfcache)
  useEffect(() => {
    // Load on initial mount
    loadSavedFormData();

    // Handle back button navigation (page restored from bfcache)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from bfcache (back/forward navigation)
        loadSavedFormData();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [loadSavedFormData]);

  // Save form data to localStorage before navigating away
  const saveFormData = () => {
    const formData = { name, email, sex, dateOffset, timeOfDay, amount, advice };
    localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
  };

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
    setHasAttemptedSubmit(true);

    if (!validate() || !sex) return;

    // Save form data before redirect to Stripe
    saveFormData();

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      sex,
      date: selectedDate,
      timeOfDay,
      contributionAmount: amount,
      parentingAdvice: advice.trim() || undefined,
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
                <span>{formatShortDate(MIN_DATE)}</span>
                <span className="font-medium" style={{ color: "var(--bob-text)" }}>
                  {formatDate(selectedDate)}
                </span>
                <span>{formatShortDate(MAX_DATE)}</span>
              </div>
            </div>

            {/* Time of Day */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: "var(--bob-text)" }}>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: "var(--bob-coral)" }} />
                  Time of Day
                </div>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {TIME_OF_DAY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTimeOfDay(option.value)}
                    className={`
                      p-3 rounded-xl border-2 transition-all text-left
                      ${timeOfDay === option.value
                        ? "border-[var(--bob-coral)] bg-[var(--bob-girl-coral)]"
                        : "border-[var(--bob-border)] bg-white hover:border-[var(--bob-coral)]"
                      }
                    `}
                  >
                    <div
                      className="font-medium text-sm"
                      style={{ color: timeOfDay === option.value ? "var(--bob-girl-coral-text)" : "var(--bob-text)" }}
                    >
                      {option.label}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: timeOfDay === option.value ? "var(--bob-girl-coral-text)" : "var(--bob-text-muted)", opacity: timeOfDay === option.value ? 0.8 : 1 }}
                    >
                      {option.range}
                    </div>
                  </button>
                ))}
              </div>
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

            {/* Parenting Advice */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--bob-text)" }}>
                Parenting Advice <span style={{ color: "var(--bob-text-muted)" }}>(optional)</span>
              </label>
              <p className="text-sm mb-2" style={{ color: "var(--bob-text-muted)" }}>
                Your single best piece of parenting advice, from those who have or have been parented
              </p>
              <div className="relative">
                <MessageSquare
                  className="absolute left-3 top-3 w-5 h-5"
                  style={{ color: "var(--bob-text-muted)" }}
                />
                <textarea
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  placeholder="Share your wisdom..."
                  maxLength={1500}
                  rows={4}
                  className="bob-input pl-11 pt-3 resize-none"
                  style={{ paddingTop: "0.75rem" }}
                />
              </div>
              <p className="mt-1 text-xs text-right" style={{ color: "var(--bob-text-muted)" }}>
                {advice.length}/1500
              </p>
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            {/* Validation Error Summary */}
            {hasAttemptedSubmit && Object.keys(errors).length > 0 && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">Please enter missing information above</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="bob-btn bob-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Complete & Pay"
              )}
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
