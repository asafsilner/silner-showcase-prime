/**
 * Curriculum Builder — turns the recommendation set into a 30-60-90 day
 * learning path shaped by the user's learning style and weekly time budget.
 *
 * Accepts revision options so the Quality Loop can trim overload or
 * rebalance phases without rebuilding everything by hand.
 */

import type {
  CurriculumItem,
  CurriculumPhase,
  CurriculumPlan,
  Exercise,
  LearningStyle,
  PersonaProfile,
  Recommendation,
} from "../types";

export interface CurriculumOptions {
  /** Quality loop can lower this to reduce load. */
  maxItemsPerPhase?: number;
}

const FORMAT_BY_STYLE: Record<LearningStyle, string> = {
  video: "קורס וידאו קצר + תרגול מונחה",
  reading: "מדריך כתוב + סיכום אישי",
  "hands-on": "פרויקט תרגול על משימה אמיתית מהעבודה",
  mentored: "סשן מודרך / למידה בזוגות",
};

const PHASE_THEMES: Record<30 | 60 | 90, string> = {
  30: "יסודות: להכיר את הכלים ולבנות ביטחון",
  60: "יישום: להטמיע את הכלים בזרימת העבודה היומית",
  90: "העמקה: אוטומציה, שילוב תהליכים ומדידה",
};

function buildExercises(rec: Recommendation, style: LearningStyle): Exercise[] {
  const base: Exercise[] = [
    {
      title: `התנסות ראשונה: ${rec.title}`,
      description:
        style === "hands-on"
          ? `קחו משימה אמיתית מהשבוע האחרון ובצעו אותה מחדש עם ${rec.title}. השוו זמן ואיכות.`
          : `עברו על חומר היכרות על ${rec.title} ורשמו שלושה שימושים רלוונטיים לעבודה שלכם.`,
      estimatedMinutes: 45,
    },
    {
      title: `שגרה שבועית עם ${rec.title}`,
      description: `בחרו משימה חוזרת אחת והעבירו אותה ל${rec.kind === "skill" ? "תרגול המיומנות" : "כלי"} למשך שבוע שלם. תעדו מה עבד ומה לא.`,
      estimatedMinutes: 60,
    },
  ];
  return base;
}

function toItem(
  rec: Recommendation,
  persona: PersonaProfile,
  itemsInPhase: number,
): CurriculumItem {
  const weeklyHours =
    Math.round((persona.timeBudgetHours / Math.max(1, itemsInPhase)) * 2) / 2;
  return {
    recommendationId: rec.id,
    title: rec.title,
    activity: rec.rationale,
    format: FORMAT_BY_STYLE[persona.learningStyle],
    weeklyHours: Math.max(0.5, weeklyHours),
    exercises: buildExercises(rec, persona.learningStyle),
  };
}

function metricsForPhase(day: 30 | 60 | 90, items: CurriculumItem[]): string[] {
  switch (day) {
    case 30:
      return [
        "השלמתם לפחות תרגיל התנסות אחד לכל נושא",
        items.length > 0
          ? `ביצעתם משימה אמיתית אחת עם ${items[0].title}`
          : "בחרתם כלי ראשון להתנסות",
        "אתם יודעים לנסח בקשה ל-AI שמחזירה תוצאה שימושית מהניסיון הראשון",
      ];
    case 60:
      return [
        "לפחות משימה שבועית אחת עוברת דרך כלי AI באופן קבוע",
        "מדדתם חיסכון בזמן על משימה אחת (לפני/אחרי)",
        "שיתפתם תוצר אחד שנעשה בעזרת AI עם עמית או מנהל",
      ];
    case 90:
      return [
        "תהליך שלם אחד רץ עם AI מקצה לקצה",
        "חיסכון שבועי מוערך של 10%+ מהזמן על המשימות שמופו",
        "יש לכם שגרת התעדכנות (ניוזלטר/קהילה) בכלי AI חדשים",
      ];
  }
}

export function buildCurriculum(
  recommendations: Recommendation[],
  persona: PersonaProfile,
  options: CurriculumOptions = {},
): CurriculumPlan {
  const maxItems = options.maxItemsPerPhase ?? 3;
  const sorted = [...recommendations].sort((a, b) => a.priority - b.priority);

  // Foundations (skills + top-priority items) first, application next,
  // the long tail last.
  const phase30 = sorted.filter((r) => r.kind === "skill" || r.priority <= 1).slice(0, maxItems);
  const used = new Set(phase30.map((r) => r.id));
  const phase60 = sorted.filter((r) => !used.has(r.id) && r.priority <= 3).slice(0, maxItems);
  for (const r of phase60) used.add(r.id);
  const phase90 = sorted.filter((r) => !used.has(r.id)).slice(0, maxItems);

  const phases: CurriculumPhase[] = ([
    [30, phase30],
    [60, phase60],
    [90, phase90],
  ] as const).map(([day, recs]) => {
    const items = recs.map((r) => toItem(r, persona, recs.length));
    return { day, theme: PHASE_THEMES[day], items, successMetrics: metricsForPhase(day, items) };
  });

  const totalWeeklyHours = Math.max(
    ...phases.map((p) => p.items.reduce((sum, i) => sum + i.weeklyHours, 0)),
    0,
  );

  return { phases, totalWeeklyHours };
}
