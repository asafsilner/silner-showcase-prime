import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AdvisorState, AgentName } from "@/advisor/types";

const AGENT_LABELS: Record<AgentName, string> = {
  research: "Research Agent",
  interview: "Interview Agent",
  "information-gap": "Information Gap Agent",
  consistency: "Consistency Agent",
  confidence: "Confidence Agent",
  "persona-builder": "Persona Builder",
  "opportunity-detector": "Opportunity Detector",
  recommendation: "Recommendation Agent",
  "curriculum-builder": "Curriculum Builder",
  critic: "Critic Agent",
  quality: "Quality Agent",
};

const FIELD_LABELS: Record<string, string> = {
  selfDescription: "תיאור אישי",
  role: "תחום עיסוק",
  tasks: "משימות",
  pains: "חסמים",
  toolsUsed: "כלים קיימים",
  aiExperience: "ניסיון AI",
  learningStyle: "סגנון למידה",
  timeBudget: "תקציב זמן",
  goals: "מטרות",
  workArtifacts: "דוגמאות עבודה",
};

/** Live view of what the agents are doing: confidence per field + trace log. */
const AgentPanel = ({ state }: { state: AdvisorState }) => {
  const recentTraces = [...state.traces].slice(-12).reverse();

  return (
    <div className="space-y-4" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">רמת ביטחון בפרופיל</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Progress value={state.confidence.overall * 100} className="flex-1" />
            <span className="text-sm font-medium w-10 text-left">
              {Math.round(state.confidence.overall * 100)}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {state.confidence.fields.map((f) => (
              <div key={f.field} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{FIELD_LABELS[f.field] ?? f.field}</span>
                <span className={f.score >= 0.7 ? "text-primary" : "text-muted-foreground"}>
                  {Math.round(f.score * 100)}%
                </span>
              </div>
            ))}
          </div>
          {state.contradictions.filter((c) => !c.resolved).length > 0 && (
            <Badge variant="destructive">סתירה פתוחה בבדיקה</Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">יומן הסוכנים</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-56">
            <div className="space-y-2">
              {recentTraces.map((t, i) => (
                <div key={`${t.at}-${i}`} className="text-xs space-y-0.5">
                  <Badge variant="outline" className="text-[10px]">
                    {AGENT_LABELS[t.agent]}
                  </Badge>
                  <p className="text-muted-foreground leading-snug">{t.summary}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentPanel;
