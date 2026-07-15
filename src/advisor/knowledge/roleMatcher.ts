/**
 * Role Matcher — maps the user's free-text self-description to role
 * archetypes in the knowledge graph via a Hebrew/English keyword lexicon.
 *
 * Keywords are matched as substrings so Hebrew inflections work without
 * stemming: the stem "מדריכ" catches מדריך / מדריכה / מדריכת.
 */

export interface RoleMatch {
  roleId: string;
  /** Sum of matched keyword weights. */
  score: number;
  /** The user's own words that triggered the match (first hit). */
  matchedPhrase: string;
}

interface Keyword {
  text: string;
  roleId: string;
  /** Strong keywords (2) identify a role on their own; weak ones (1) need company. */
  weight: number;
}

const LEXICON: Keyword[] = [
  /* Coaching, fitness & therapy */
  { text: "יוגה", roleId: "role-coach", weight: 2 },
  { text: "פילאטיס", roleId: "role-coach", weight: 2 },
  { text: "מאמנ", roleId: "role-coach", weight: 2 },
  { text: "מדריכ", roleId: "role-coach", weight: 1 },
  { text: "כושר", roleId: "role-coach", weight: 2 },
  { text: "סטודיו", roleId: "role-coach", weight: 1 },
  { text: "מטפל", roleId: "role-coach", weight: 2 },
  { text: "עיסוי", roleId: "role-coach", weight: 2 },
  { text: "מדיטציה", roleId: "role-coach", weight: 2 },
  { text: "הנחי", roleId: "role-coach", weight: 1 },
  { text: "yoga", roleId: "role-coach", weight: 2 },
  { text: "pilates", roleId: "role-coach", weight: 2 },
  { text: "coach", roleId: "role-coach", weight: 2 },
  { text: "trainer", roleId: "role-coach", weight: 2 },

  /* Software development */
  { text: "מתכנת", roleId: "role-dev", weight: 2 },
  { text: "מפתח", roleId: "role-dev", weight: 2 },
  { text: "תוכנה", roleId: "role-dev", weight: 2 },
  { text: "קוד", roleId: "role-dev", weight: 1 },
  { text: "developer", roleId: "role-dev", weight: 2 },
  { text: "backend", roleId: "role-dev", weight: 2 },
  { text: "frontend", roleId: "role-dev", weight: 2 },
  { text: "fullstack", roleId: "role-dev", weight: 2 },
  { text: "devops", roleId: "role-dev", weight: 2 },
  { text: "qa", roleId: "role-dev", weight: 1 },

  /* Design & creative */
  { text: "מעצב", roleId: "role-design", weight: 2 },
  { text: "עיצוב", roleId: "role-design", weight: 2 },
  { text: "גרפיק", roleId: "role-design", weight: 2 },
  { text: "אנימצי", roleId: "role-design", weight: 2 },
  { text: "designer", roleId: "role-design", weight: 2 },
  { text: "ux", roleId: "role-design", weight: 1 },
  { text: "ui", roleId: "role-design", weight: 1 },

  /* Product / project management */
  { text: "מנהל מוצר", roleId: "role-pm", weight: 2 },
  { text: "מנהלת מוצר", roleId: "role-pm", weight: 2 },
  { text: "מוצר", roleId: "role-pm", weight: 1 },
  { text: "פרויקט", roleId: "role-pm", weight: 1 },
  { text: "product", roleId: "role-pm", weight: 1 },
  { text: "סקראם", roleId: "role-pm", weight: 2 },

  /* Marketing & content */
  { text: "שיווק", roleId: "role-marketing", weight: 2 },
  { text: "קופירייט", roleId: "role-marketing", weight: 2 },
  { text: "קמפיינ", roleId: "role-marketing", weight: 2 },
  { text: "תוכן", roleId: "role-marketing", weight: 1 },
  { text: "marketing", roleId: "role-marketing", weight: 2 },
  { text: "סושיאל", roleId: "role-marketing", weight: 1 },

  /* Sales & service */
  { text: "מכירות", roleId: "role-sales", weight: 2 },
  { text: "אנשי מכירות", roleId: "role-sales", weight: 2 },
  { text: "שירות לקוחות", roleId: "role-sales", weight: 2 },
  { text: "sales", roleId: "role-sales", weight: 2 },

  /* Operations & admin */
  { text: "תפעול", roleId: "role-ops", weight: 2 },
  { text: "אדמיניסטרצי", roleId: "role-ops", weight: 2 },
  { text: "מזכיר", roleId: "role-ops", weight: 2 },
  { text: "לוגיסטיק", roleId: "role-ops", weight: 2 },

  /* Finance & data */
  { text: "כספים", roleId: "role-finance", weight: 2 },
  { text: "אנליסט", roleId: "role-finance", weight: 2 },
  { text: "נתונים", roleId: "role-finance", weight: 1 },
  { text: "כלכלנ", roleId: "role-finance", weight: 2 },
  { text: "finance", roleId: "role-finance", weight: 2 },

  /* Teaching */
  { text: "מורה", roleId: "role-education", weight: 2 },
  { text: "מרצה", roleId: "role-education", weight: 2 },
  { text: "גננת", roleId: "role-education", weight: 2 },
  { text: "בית ספר", roleId: "role-education", weight: 2 },
  { text: "תלמיד", roleId: "role-education", weight: 1 },
  { text: "הוראה", roleId: "role-education", weight: 2 },

  /* Small business / freelance */
  { text: "עצמאי", roleId: "role-smallbiz", weight: 2 },
  { text: "פרילנס", roleId: "role-smallbiz", weight: 2 },
  { text: "עסק שלי", roleId: "role-smallbiz", weight: 2 },
  { text: "בעל עסק", roleId: "role-smallbiz", weight: 2 },
  { text: "בעלת עסק", roleId: "role-smallbiz", weight: 2 },
  { text: "freelance", roleId: "role-smallbiz", weight: 2 },

  /* Health & medicine */
  { text: "רופא", roleId: "role-health", weight: 2 },
  { text: "אחות", roleId: "role-health", weight: 2 },
  { text: "פיזיותרפ", roleId: "role-health", weight: 2 },
  { text: "קלינא", roleId: "role-health", weight: 2 },
  { text: "מרפאה", roleId: "role-health", weight: 2 },
  { text: "דיאטנ", roleId: "role-health", weight: 2 },

  /* Legal & consulting */
  { text: "עורך דין", roleId: "role-legal", weight: 2 },
  { text: "עורכת דין", roleId: "role-legal", weight: 2 },
  { text: "עו\"ד", roleId: "role-legal", weight: 2 },
  { text: "משפט", roleId: "role-legal", weight: 1 },
  { text: "רואה חשבון", roleId: "role-legal", weight: 2 },
  { text: "רו\"ח", roleId: "role-legal", weight: 2 },
  { text: "יועצ", roleId: "role-legal", weight: 1 },

  /* Photo / video / media */
  { text: "צלמ", roleId: "role-media", weight: 2 },
  { text: "צילום", roleId: "role-media", weight: 2 },
  { text: "וידאו", roleId: "role-media", weight: 1 },
  { text: "עריכת וידאו", roleId: "role-media", weight: 2 },
  { text: "פודקאסט", roleId: "role-media", weight: 2 },
];

/** Score threshold at which the top match is trusted without asking. */
export const AUTO_ASSIGN_SCORE = 2;

export function matchRoles(text: string): RoleMatch[] {
  const normalized = text.toLowerCase();
  const byRole = new Map<string, RoleMatch>();

  for (const kw of LEXICON) {
    if (!normalized.includes(kw.text.toLowerCase())) continue;
    const existing = byRole.get(kw.roleId);
    if (existing) {
      existing.score += kw.weight;
    } else {
      byRole.set(kw.roleId, { roleId: kw.roleId, score: kw.weight, matchedPhrase: kw.text });
    }
  }

  return [...byRole.values()].sort((a, b) => b.score - a.score);
}
