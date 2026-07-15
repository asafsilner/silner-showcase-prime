/**
 * Seed knowledge for the Research Agent: roles, tasks, pains, tools,
 * methods and skills, plus the relations between them.
 *
 * Labels are in Hebrew because the advisor UI is Hebrew-first.
 */

import type { EdgeKind, NodeKind } from "../types";

export interface SeedNode {
  id: string;
  kind: NodeKind;
  label: string;
  description?: string;
  tags: string[];
}

export interface SeedEdge {
  from: string;
  to: string;
  kind: EdgeKind;
  weight: number;
}

export const seedNodes: SeedNode[] = [
  /* ---------------------------- Roles ---------------------------- */
  { id: "role-dev", kind: "role", label: "פיתוח תוכנה", tags: ["code", "tech"] },
  { id: "role-design", kind: "role", label: "עיצוב וקריאייטיב", tags: ["visual", "creative"] },
  { id: "role-pm", kind: "role", label: "ניהול מוצר / פרויקטים", tags: ["management", "planning"] },
  { id: "role-marketing", kind: "role", label: "שיווק ותוכן", tags: ["content", "growth"] },
  { id: "role-sales", kind: "role", label: "מכירות ושירות לקוחות", tags: ["crm", "communication"] },
  { id: "role-ops", kind: "role", label: "תפעול ואדמיניסטרציה", tags: ["operations", "process"] },
  { id: "role-finance", kind: "role", label: "כספים וניתוח נתונים", tags: ["data", "analysis"] },
  { id: "role-education", kind: "role", label: "הוראה והדרכה", tags: ["teaching", "content"] },
  { id: "role-coach", kind: "role", label: "אימון, הדרכה גופנית וטיפול", description: "יוגה, פילאטיס, כושר, טיפול והנחיה אישית", tags: ["clients", "wellness", "in-person"] },
  { id: "role-smallbiz", kind: "role", label: "עסק עצמאי / פרילנס", tags: ["clients", "business"] },
  { id: "role-health", kind: "role", label: "בריאות ורפואה", tags: ["clients", "care"] },
  { id: "role-legal", kind: "role", label: "משפטים, ייעוץ וראיית חשבון", tags: ["documents", "clients"] },
  { id: "role-media", kind: "role", label: "צילום, וידאו ומדיה", tags: ["visual", "creative", "clients"] },

  /* ---------------------------- Tasks ---------------------------- */
  { id: "task-writing", kind: "task", label: "כתיבת מסמכים, מיילים ותוכן", tags: ["writing"] },
  { id: "task-meetings", kind: "task", label: "פגישות, סיכומים ותיאומים", tags: ["meetings", "communication"] },
  { id: "task-data", kind: "task", label: "עבודה עם נתונים, דוחות ואקסלים", tags: ["data", "analysis"] },
  { id: "task-coding", kind: "task", label: "כתיבת קוד ותחזוקת מערכות", tags: ["code"] },
  { id: "task-visuals", kind: "task", label: "יצירת ויז'ואלים, מצגות וגרפיקה", tags: ["visual", "creative"] },
  { id: "task-research", kind: "task", label: "מחקר, איסוף מידע ולמידה", tags: ["research"] },
  { id: "task-repetitive", kind: "task", label: "משימות חוזרות ותהליכים ידניים", tags: ["process", "automation"] },
  { id: "task-planning", kind: "task", label: "תכנון, תעדוף וניהול משימות", tags: ["planning", "management"] },
  { id: "task-clients", kind: "task", label: "ניהול לקוחות: תיאומים, זימונים ותזכורות", tags: ["clients", "scheduling"] },
  { id: "task-social", kind: "task", label: "שיווק עצמי ותוכן לרשתות חברתיות", tags: ["marketing", "content", "social"] },
  { id: "task-lessons", kind: "task", label: "הכנת תכנים לשיעורים, סדנאות ומפגשים", tags: ["teaching", "content"] },
  { id: "task-billing", kind: "task", label: "חשבוניות, גבייה ואדמיניסטרציה של העסק", tags: ["business", "admin"] },
  { id: "task-inperson", kind: "task", label: "עבודה פרונטלית עם אנשים (שיעורים, טיפולים, פגישות)", tags: ["clients", "in-person"] },

  /* ---------------------------- Pains ---------------------------- */
  { id: "pain-time-writing", kind: "pain", label: "כתיבה ועריכה גוזלות שעות", tags: ["writing"] },
  { id: "pain-meeting-overload", kind: "pain", label: "עומס פגישות וסיכומים שלא נכתבים", tags: ["meetings"] },
  { id: "pain-manual-data", kind: "pain", label: "עיבוד נתונים ידני ואיטי", tags: ["data"] },
  { id: "pain-boilerplate", kind: "pain", label: "קוד שגרתי וחוזר על עצמו", tags: ["code"] },
  { id: "pain-design-iterations", kind: "pain", label: "איטרציות עיצוב ארוכות ויקרות", tags: ["visual"] },
  { id: "pain-info-overload", kind: "pain", label: "הצפת מידע וקושי להתעדכן", tags: ["research"] },
  { id: "pain-manual-process", kind: "pain", label: "תהליכים ידניים שאפשר להפוך לאוטומטיים", tags: ["automation", "process"] },
  { id: "pain-context-switch", kind: "pain", label: "קפיצה בין כלים ואיבוד הקשר", tags: ["planning", "process"] },
  { id: "pain-scheduling", kind: "pain", label: "הלוך-ושוב אינסופי על תיאומים וביטולים", tags: ["scheduling", "clients"] },
  { id: "pain-selfmarketing", kind: "pain", label: "תוכן לרשתות גוזל ערבים שלמים", tags: ["social", "marketing"] },
  { id: "pain-billing-admin", kind: "pain", label: "גבייה, חשבוניות וניירת של העסק", tags: ["admin", "business"] },
  { id: "pain-lesson-prep", kind: "pain", label: "הכנת תכנים חדשים לוקחת יותר זמן מהמפגש עצמו", tags: ["teaching", "content"] },

  /* ---------------------------- Tools ---------------------------- */
  { id: "tool-claude", kind: "tool", label: "Claude", description: "עוזר AI לכתיבה, ניתוח וסיכום", tags: ["writing", "research", "data"] },
  { id: "tool-claude-code", kind: "tool", label: "Claude Code", description: "סוכן קוד אוטונומי בטרמינל וב-IDE", tags: ["code", "automation"] },
  { id: "tool-copilot", kind: "tool", label: "GitHub Copilot", description: "השלמת קוד בזמן אמת", tags: ["code"] },
  { id: "tool-notebooklm", kind: "tool", label: "NotebookLM", description: "מחקר וסיכום מסמכים ארוכים", tags: ["research"] },
  { id: "tool-midjourney", kind: "tool", label: "Midjourney", description: "יצירת תמונות וקונספטים", tags: ["visual", "creative"] },
  { id: "tool-figma-ai", kind: "tool", label: "Figma AI", description: "עיצוב ממשקים בעזרת AI", tags: ["visual"] },
  { id: "tool-zapier", kind: "tool", label: "Zapier / Make", description: "אוטומציה של תהליכים בין כלים", tags: ["automation", "process"] },
  { id: "tool-sheets-ai", kind: "tool", label: "AI בגיליונות (Sheets/Excel)", description: "נוסחאות, ניקוי וניתוח נתונים עם AI", tags: ["data"] },
  { id: "tool-otter", kind: "tool", label: "תמלול וסיכום פגישות (Otter/Fireflies)", description: "סיכומי פגישות אוטומטיים", tags: ["meetings"] },
  { id: "tool-gamma", kind: "tool", label: "Gamma", description: "יצירת מצגות מטקסט", tags: ["visual", "writing"] },
  { id: "tool-scheduling", kind: "tool", label: "זימון חכם (Calendly/TidyCal)", description: "לקוחות קובעים לבד, תזכורות אוטומטיות", tags: ["scheduling", "clients"] },
  { id: "tool-canva", kind: "tool", label: "Canva Magic Studio", description: "פוסטים, סטוריז וגרפיקה לרשתות בדקות", tags: ["social", "visual", "marketing"] },
  { id: "tool-whatsapp-biz", kind: "tool", label: "WhatsApp Business + אוטומציות", description: "מענה אוטומטי, תזכורות ותיאומים עם לקוחות", tags: ["clients", "scheduling"] },
  { id: "tool-green-invoice", kind: "tool", label: "חשבונית ירוקה / iCount", description: "חשבוניות וגבייה אוטומטיות לעצמאים", tags: ["admin", "business"] },

  /* ---------------------------- Methods ---------------------------- */
  { id: "method-prompting", kind: "method", label: "כתיבת פרומפטים אפקטיבית", tags: ["writing", "research", "data", "code"] },
  { id: "method-workflow", kind: "method", label: "בניית תהליך עבודה עם AI בלולאה", tags: ["process", "automation"] },
  { id: "method-agents", kind: "method", label: "עבודה עם סוכני AI אוטונומיים", tags: ["automation", "code"] },
  { id: "method-verification", kind: "method", label: "ביקורת ואימות תוצרי AI", tags: ["research", "data"] },

  /* ---------------------------- Skills ---------------------------- */
  { id: "skill-prompting", kind: "skill", label: "ניסוח משימות ל-AI", tags: ["writing"] },
  { id: "skill-context", kind: "skill", label: "מתן הקשר ודוגמאות למודל", tags: ["writing", "research"] },
  { id: "skill-automation", kind: "skill", label: "חשיבה אוטומטית: זיהוי תהליכים לאוטומציה", tags: ["automation"] },
  { id: "skill-critique", kind: "skill", label: "הערכה ביקורתית של פלט AI", tags: ["research"] },
];

export const seedEdges: SeedEdge[] = [
  /* role -> task (performs) */
  { from: "role-dev", to: "task-coding", kind: "performs", weight: 1 },
  { from: "role-dev", to: "task-repetitive", kind: "performs", weight: 0.6 },
  { from: "role-dev", to: "task-writing", kind: "performs", weight: 0.4 },
  { from: "role-design", to: "task-visuals", kind: "performs", weight: 1 },
  { from: "role-design", to: "task-research", kind: "performs", weight: 0.5 },
  { from: "role-pm", to: "task-planning", kind: "performs", weight: 1 },
  { from: "role-pm", to: "task-meetings", kind: "performs", weight: 0.9 },
  { from: "role-pm", to: "task-writing", kind: "performs", weight: 0.7 },
  { from: "role-marketing", to: "task-writing", kind: "performs", weight: 1 },
  { from: "role-marketing", to: "task-visuals", kind: "performs", weight: 0.7 },
  { from: "role-marketing", to: "task-data", kind: "performs", weight: 0.5 },
  { from: "role-sales", to: "task-meetings", kind: "performs", weight: 1 },
  { from: "role-sales", to: "task-writing", kind: "performs", weight: 0.7 },
  { from: "role-ops", to: "task-repetitive", kind: "performs", weight: 1 },
  { from: "role-ops", to: "task-data", kind: "performs", weight: 0.6 },
  { from: "role-finance", to: "task-data", kind: "performs", weight: 1 },
  { from: "role-finance", to: "task-writing", kind: "performs", weight: 0.4 },
  { from: "role-education", to: "task-writing", kind: "performs", weight: 0.8 },
  { from: "role-education", to: "task-visuals", kind: "performs", weight: 0.6 },
  { from: "role-education", to: "task-research", kind: "performs", weight: 0.7 },
  { from: "role-education", to: "task-lessons", kind: "performs", weight: 1 },
  { from: "role-coach", to: "task-inperson", kind: "performs", weight: 1 },
  { from: "role-coach", to: "task-clients", kind: "performs", weight: 0.9 },
  { from: "role-coach", to: "task-lessons", kind: "performs", weight: 0.8 },
  { from: "role-coach", to: "task-social", kind: "performs", weight: 0.7 },
  { from: "role-coach", to: "task-billing", kind: "performs", weight: 0.6 },
  { from: "role-smallbiz", to: "task-clients", kind: "performs", weight: 1 },
  { from: "role-smallbiz", to: "task-social", kind: "performs", weight: 0.9 },
  { from: "role-smallbiz", to: "task-billing", kind: "performs", weight: 0.8 },
  { from: "role-smallbiz", to: "task-writing", kind: "performs", weight: 0.5 },
  { from: "role-health", to: "task-inperson", kind: "performs", weight: 1 },
  { from: "role-health", to: "task-clients", kind: "performs", weight: 0.8 },
  { from: "role-health", to: "task-writing", kind: "performs", weight: 0.6 },
  { from: "role-health", to: "task-research", kind: "performs", weight: 0.5 },
  { from: "role-legal", to: "task-writing", kind: "performs", weight: 1 },
  { from: "role-legal", to: "task-research", kind: "performs", weight: 0.8 },
  { from: "role-legal", to: "task-clients", kind: "performs", weight: 0.7 },
  { from: "role-legal", to: "task-billing", kind: "performs", weight: 0.5 },
  { from: "role-media", to: "task-visuals", kind: "performs", weight: 1 },
  { from: "role-media", to: "task-clients", kind: "performs", weight: 0.7 },
  { from: "role-media", to: "task-social", kind: "performs", weight: 0.8 },
  { from: "role-media", to: "task-billing", kind: "performs", weight: 0.5 },

  /* task -> pain (suffers) */
  { from: "task-writing", to: "pain-time-writing", kind: "suffers", weight: 1 },
  { from: "task-meetings", to: "pain-meeting-overload", kind: "suffers", weight: 1 },
  { from: "task-data", to: "pain-manual-data", kind: "suffers", weight: 1 },
  { from: "task-coding", to: "pain-boilerplate", kind: "suffers", weight: 1 },
  { from: "task-visuals", to: "pain-design-iterations", kind: "suffers", weight: 1 },
  { from: "task-research", to: "pain-info-overload", kind: "suffers", weight: 1 },
  { from: "task-repetitive", to: "pain-manual-process", kind: "suffers", weight: 1 },
  { from: "task-planning", to: "pain-context-switch", kind: "suffers", weight: 1 },
  { from: "task-clients", to: "pain-scheduling", kind: "suffers", weight: 1 },
  { from: "task-social", to: "pain-selfmarketing", kind: "suffers", weight: 1 },
  { from: "task-lessons", to: "pain-lesson-prep", kind: "suffers", weight: 1 },
  { from: "task-billing", to: "pain-billing-admin", kind: "suffers", weight: 1 },
  { from: "task-inperson", to: "pain-scheduling", kind: "suffers", weight: 0.6 },

  /* tool -> pain (solves) */
  { from: "tool-claude", to: "pain-time-writing", kind: "solves", weight: 1 },
  { from: "tool-claude", to: "pain-info-overload", kind: "solves", weight: 0.9 },
  { from: "tool-claude", to: "pain-manual-data", kind: "solves", weight: 0.6 },
  { from: "tool-claude-code", to: "pain-boilerplate", kind: "solves", weight: 1 },
  { from: "tool-claude-code", to: "pain-manual-process", kind: "solves", weight: 0.7 },
  { from: "tool-copilot", to: "pain-boilerplate", kind: "solves", weight: 0.8 },
  { from: "tool-notebooklm", to: "pain-info-overload", kind: "solves", weight: 1 },
  { from: "tool-midjourney", to: "pain-design-iterations", kind: "solves", weight: 0.9 },
  { from: "tool-figma-ai", to: "pain-design-iterations", kind: "solves", weight: 0.8 },
  { from: "tool-zapier", to: "pain-manual-process", kind: "solves", weight: 1 },
  { from: "tool-zapier", to: "pain-context-switch", kind: "solves", weight: 0.7 },
  { from: "tool-sheets-ai", to: "pain-manual-data", kind: "solves", weight: 1 },
  { from: "tool-otter", to: "pain-meeting-overload", kind: "solves", weight: 1 },
  { from: "tool-gamma", to: "pain-design-iterations", kind: "solves", weight: 0.6 },
  { from: "tool-gamma", to: "pain-time-writing", kind: "solves", weight: 0.5 },
  { from: "tool-scheduling", to: "pain-scheduling", kind: "solves", weight: 1 },
  { from: "tool-whatsapp-biz", to: "pain-scheduling", kind: "solves", weight: 0.8 },
  { from: "tool-canva", to: "pain-selfmarketing", kind: "solves", weight: 1 },
  { from: "tool-claude", to: "pain-selfmarketing", kind: "solves", weight: 0.8 },
  { from: "tool-claude", to: "pain-lesson-prep", kind: "solves", weight: 0.9 },
  { from: "tool-gamma", to: "pain-lesson-prep", kind: "solves", weight: 0.6 },
  { from: "tool-green-invoice", to: "pain-billing-admin", kind: "solves", weight: 1 },
  { from: "tool-zapier", to: "pain-billing-admin", kind: "solves", weight: 0.6 },

  /* method -> pain (solves) */
  { from: "method-prompting", to: "pain-time-writing", kind: "solves", weight: 0.8 },
  { from: "method-workflow", to: "pain-context-switch", kind: "solves", weight: 0.8 },
  { from: "method-workflow", to: "pain-manual-process", kind: "solves", weight: 0.8 },
  { from: "method-agents", to: "pain-manual-process", kind: "solves", weight: 0.9 },
  { from: "method-agents", to: "pain-boilerplate", kind: "solves", weight: 0.7 },
  { from: "method-verification", to: "pain-info-overload", kind: "solves", weight: 0.6 },

  /* tool/method -> skill (requires) */
  { from: "tool-claude", to: "skill-prompting", kind: "requires", weight: 1 },
  { from: "tool-claude", to: "skill-context", kind: "requires", weight: 0.8 },
  { from: "tool-claude-code", to: "skill-prompting", kind: "requires", weight: 0.9 },
  { from: "tool-claude-code", to: "skill-automation", kind: "requires", weight: 0.8 },
  { from: "tool-notebooklm", to: "skill-critique", kind: "requires", weight: 0.7 },
  { from: "tool-zapier", to: "skill-automation", kind: "requires", weight: 1 },
  { from: "tool-sheets-ai", to: "skill-prompting", kind: "requires", weight: 0.7 },

  /* method -> skill (teaches) */
  { from: "method-prompting", to: "skill-prompting", kind: "teaches", weight: 1 },
  { from: "method-prompting", to: "skill-context", kind: "teaches", weight: 0.9 },
  { from: "method-workflow", to: "skill-automation", kind: "teaches", weight: 0.9 },
  { from: "method-agents", to: "skill-automation", kind: "teaches", weight: 0.8 },
  { from: "method-verification", to: "skill-critique", kind: "teaches", weight: 1 },
];
