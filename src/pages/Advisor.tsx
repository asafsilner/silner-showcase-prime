import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles } from "lucide-react";
import { useAdvisor } from "@/advisor/useAdvisor";
import { MAX_QUESTIONS } from "@/advisor/orchestrator";
import { isLLMConfigured } from "@/advisor/llm/config";
import QuestionCard from "@/components/advisor/QuestionCard";
import AgentPanel from "@/components/advisor/AgentPanel";
import ReportView from "@/components/advisor/ReportView";
import LLMSettings from "@/components/advisor/LLMSettings";

/**
 * Personal AI Advisor: a multi-agent system that interviews the user,
 * builds a persona, and produces a personalized 30-60-90 learning plan
 * with tool recommendations. With a Claude API key configured, the
 * interview and report are driven by the live model.
 */
const Advisor = () => {
  const [started, setStarted] = useState(false);
  const [, setSettingsVersion] = useState(0);
  const { state, submitAnswer, restart, busy } = useAdvisor();
  const refreshSettings = useCallback(() => setSettingsVersion((v) => v + 1), []);

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container px-6 md:px-8 max-w-5xl">
        {!started ? (
          <motion.section
            dir="rtl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center space-y-6 py-16"
          >
            <Sparkles className="w-12 h-12 text-primary mx-auto" />
            <h1 className="text-4xl font-bold">היועץ האישי שלך ל-AI</h1>
            <p className="text-muted-foreground leading-relaxed">
              שיחה קצרה (5–10 דקות) שבה צוות סוכני AI מכיר את העבודה שלך, מזהה חסמים
              והזדמנויות, ובונה לך תוכנית לימוד אישית ל-90 יום עם המלצות על כלים,
              תרגילים ומדדי הצלחה.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>🔍 סוכן פערי מידע דואג שנשאל רק מה שחשוב</li>
              <li>⚖️ סוכן עקביות מזהה סתירות ומבקש הבהרות</li>
              <li>🎯 סוכני ביקורת ואיכות בודקים כל המלצה לפני שהיא מגיעה אליך</li>
            </ul>
            <div className="flex flex-col items-center gap-3">
              <Button size="lg" onClick={() => setStarted(true)}>
                מתחילים את הראיון
              </Button>
              <LLMSettings onChange={refreshSettings} />
              {!isLLMConfigured() && (
                <p className="text-xs text-muted-foreground">
                  טיפ: חיבור מפתח Claude API הופך את הראיון לשיחה חכמה באמת.
                </p>
              )}
            </div>
          </motion.section>
        ) : state.phase === "done" && state.report ? (
          <ReportView report={state.report} onRestart={restart} />
        ) : (
          <div className="grid md:grid-cols-[1fr_320px] gap-6 items-start">
            <div className="space-y-4">
              <div dir="rtl" className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>שאלה {state.questionCount} מתוך עד {MAX_QUESTIONS}</span>
                  <span>{Math.round(state.confidence.overall * 100)}% ביטחון</span>
                </div>
                <Progress value={(state.questionCount / MAX_QUESTIONS) * 100} />
              </div>
              {busy ? (
                <div
                  dir="rtl"
                  className="flex items-center justify-center gap-3 py-16 text-muted-foreground"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>
                    {state.phase === "synthesizing" || state.gaps.length === 0
                      ? "הסוכנים מנתחים ובונים את התוכנית שלך..."
                      : "היועץ חושב על השאלה הבאה..."}
                  </span>
                </div>
              ) : (
                state.currentQuestion && (
                  <QuestionCard
                    key={state.currentQuestion.id}
                    question={state.currentQuestion}
                    onAnswer={submitAnswer}
                  />
                )
              )}
            </div>
            <AgentPanel state={state} />
          </div>
        )}
      </div>
    </main>
  );
};

export default Advisor;
