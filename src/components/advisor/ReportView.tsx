import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Lightbulb, RotateCcw, Sparkles, Target, Wrench } from "lucide-react";
import type { AdvisorReport } from "@/advisor/types";

const STYLE_LABELS: Record<string, string> = {
  video: "וידאו וקורסים",
  reading: "קריאה ומדריכים",
  "hands-on": "למידה תוך כדי עשייה",
  mentored: "ליווי אישי",
};

interface ReportViewProps {
  report: AdvisorReport;
  onRestart: () => void;
}

/**
 * The final deliverable: profile summary, task map, opportunities,
 * tool/skill recommendations and the 30-60-90 curriculum with exercises
 * and success metrics.
 */
const ReportView = ({ report, onRestart }: ReportViewProps) => {
  const { persona, taskMap, opportunities, recommendations, curriculum, quality } = report;

  return (
    <motion.div
      dir="rtl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Profile summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            תקציר הפרופיל שלך
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge>{persona.roleLabel}</Badge>
            <Badge variant="secondary">ניסיון AI: {persona.aiExperience}/10</Badge>
            <Badge variant="secondary">{STYLE_LABELS[persona.learningStyle]}</Badge>
            <Badge variant="secondary">{persona.timeBudgetHours} שעות למידה בשבוע</Badge>
            <Badge variant="outline">
              ביטחון בפרופיל: {Math.round(persona.confidence.overall * 100)}%
            </Badge>
          </div>
          {persona.selfDescription && (
            <p className="text-sm text-muted-foreground border-r-2 border-primary pr-3">
              "{persona.selfDescription}"
            </p>
          )}
          {persona.goals && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">המטרה שלך: </span>
              {persona.goals}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Personal narrative from the live model */}
      {report.narrative && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              כמה מילים ממני אליך
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-line">{report.narrative}</p>
          </CardContent>
        </Card>
      )}

      {/* Task map */}
      <Card>
        <CardHeader>
          <CardTitle>מפת המשימות והחסמים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {taskMap.map((task, i) => (
              <div key={task.taskId} className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="outline">#{i + 1}</Badge>
                <span className="font-medium">{task.label}</span>
                {task.painLabels.map((p) => (
                  <Badge key={p} variant="destructive" className="font-normal">
                    {p}
                  </Badge>
                ))}
              </div>
            ))}
            {taskMap.length === 0 && (
              <p className="text-sm text-muted-foreground">לא מופו משימות בראיון.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            הזדמנויות לשיפור
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {opportunities.map((opp) => (
            <div key={opp.id} className="space-y-1 border-r-2 border-primary pr-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-sm">{opp.title}</span>
                <Badge variant="secondary">השפעה {opp.impact}/5</Badge>
                <Badge variant="outline">מאמץ {opp.effort}/5</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{opp.description}</p>
            </div>
          ))}
          {opportunities.length === 0 && (
            <p className="text-sm text-muted-foreground">
              לא זוהו הזדמנויות — נסו לענות על יותר שאלות בראיון הבא.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            כלים ומיומנויות מומלצים
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.map((rec) => (
            <div key={rec.id} className="flex items-start gap-3">
              <Badge variant={rec.kind === "skill" ? "secondary" : "default"}>
                {rec.kind === "tool" ? "כלי" : rec.kind === "skill" ? "מיומנות" : "שיטה"}
              </Badge>
              <div>
                <p className="text-sm font-medium">{rec.title}</p>
                <p className="text-xs text-muted-foreground">{rec.rationale}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 30-60-90 curriculum */}
      <Card>
        <CardHeader>
          <CardTitle>מסלול לימוד 30-60-90</CardTitle>
          <p className="text-sm text-muted-foreground">
            כ-{curriculum.totalWeeklyHours} שעות בשבוע, מותאם לסגנון "{STYLE_LABELS[persona.learningStyle]}"
          </p>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible defaultValue="phase-30">
            {curriculum.phases.map((phase) => (
              <AccordionItem key={phase.day} value={`phase-${phase.day}`}>
                <AccordionTrigger className="text-right">
                  <span>
                    יום 1–{phase.day === 30 ? 30 : phase.day} · {phase.theme}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {phase.items.map((item) => (
                    <div key={item.recommendationId} className="space-y-2 rounded-md border border-border p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm">{item.title}</span>
                        <Badge variant="outline">{item.weeklyHours} ש' בשבוע</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.format}</p>
                      <ul className="space-y-1">
                        {item.exercises.map((ex) => (
                          <li key={ex.title} className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{ex.title}</span>
                            {" — "}
                            {ex.description} (~{ex.estimatedMinutes} דק')
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {phase.items.length === 0 && (
                    <p className="text-sm text-muted-foreground">שלב זה נשאר גמיש — נמלא אותו לפי ההתקדמות.</p>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      מדדי הצלחה לשלב
                    </p>
                    <ul className="list-disc pr-5 space-y-0.5">
                      {phase.successMetrics.map((m) => (
                        <li key={m} className="text-xs text-muted-foreground">
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Quality + restart */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          התוכנית עברה {report.criticRounds} סבבי ביקורת ו-{report.qualityRounds} בדיקות איכות
          (ציון {Math.round(quality.score * 100)}%).
          {!quality.passed && ` הסתייגויות: ${quality.issues.join("; ")}`}
        </p>
        <Button variant="outline" onClick={onRestart} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          התחלת ראיון חדש
        </Button>
      </div>
    </motion.div>
  );
};

export default ReportView;
