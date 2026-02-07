import { supabase } from "./supabase";
import type { GuessData } from "../App";

export interface GuessRecord {
  id: string;
  name: string;
  email: string;
  sex: "boy" | "girl";
  guess_date: string;
  contribution_amount: number;
  parenting_advice: string | null;
  created_at: string;
}

export interface SubmitGuessResult {
  success: boolean;
  error?: string;
  data?: GuessRecord;
}

export async function submitGuess(guess: GuessData): Promise<SubmitGuessResult> {
  try {
    const { data, error } = await supabase
      .from("guesses")
      .insert({
        name: guess.name,
        email: guess.email,
        sex: guess.sex,
        guess_date: guess.date.toISOString().split("T")[0],
        contribution_amount: guess.contributionAmount,
        parenting_advice: guess.parentingAdvice || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error submitting guess:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data as GuessRecord,
    };
  } catch (err) {
    console.error("Unexpected error submitting guess:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function getGuesses(): Promise<GuessRecord[]> {
  const { data, error } = await supabase
    .from("guesses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching guesses:", error);
    return [];
  }

  return data as GuessRecord[];
}
