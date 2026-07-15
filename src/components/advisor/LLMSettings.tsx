import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Cpu, Settings2, XCircle } from "lucide-react";
import {
  AVAILABLE_MODELS,
  getApiKey,
  getModel,
  isLLMConfigured,
  setApiKey,
  setModel,
} from "@/advisor/llm/config";
import { testConnection } from "@/advisor/llm/llmService";

interface LLMSettingsProps {
  /** Called after save so the parent can refresh the live/demo badge. */
  onChange?: () => void;
}

/**
 * BYO-key settings: the Claude API key is stored only in this browser's
 * localStorage and sent directly to Anthropic — no other server sees it.
 */
const LLMSettings = ({ onChange }: LLMSettingsProps) => {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(getApiKey() ?? "");
  const [model, setModelState] = useState(getModel());
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);

  const save = () => {
    setApiKey(key);
    setModel(model);
    setTestResult(null);
    setOpen(false);
    onChange?.();
  };

  const runTest = async () => {
    setApiKey(key);
    setModel(model);
    setTesting(true);
    setTestResult(null);
    try {
      setTestResult(await testConnection());
    } finally {
      setTesting(false);
    }
    onChange?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="w-4 h-4" />
          חיבור למודל
          {isLLMConfigured() ? (
            <Badge className="gap-1"><Cpu className="w-3 h-3" /> חי</Badge>
          ) : (
            <Badge variant="secondary">דמו</Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="text-right">
        <DialogHeader className="text-right sm:text-right">
          <DialogTitle>חיבור ל-Claude API</DialogTitle>
          <DialogDescription>
            עם מפתח API הראיון מנוהל על ידי מודל אמיתי: ניתוח התיאור שלך, ניסוח
            השאלות וסיכום אישי בדוח. בלי מפתח — המערכת רצה במצב דמו (חוקים בלבד).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">מפתח API של Anthropic</Label>
            <Input
              id="api-key"
              dir="ltr"
              type="password"
              placeholder="sk-ant-..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              המפתח נשמר רק בדפדפן הזה (localStorage) ונשלח ישירות ל-Anthropic —
              אף שרת אחר לא רואה אותו. משיגים מפתח ב-console.anthropic.com.
            </p>
          </div>
          <div className="space-y-2">
            <Label>מודל</Label>
            <Select value={model} onValueChange={setModelState}>
              <SelectTrigger dir="rtl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {AVAILABLE_MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {testResult && (
            <p
              className={`text-sm flex items-center gap-2 ${testResult.ok ? "text-primary" : "text-destructive"}`}
            >
              {testResult.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {testResult.message}
            </p>
          )}
          <div className="flex gap-2">
            <Button onClick={save} className="flex-1">
              שמירה
            </Button>
            <Button variant="outline" onClick={runTest} disabled={testing || !key.trim()}>
              {testing ? "בודק..." : "בדיקת חיבור"}
            </Button>
            {key && (
              <Button
                variant="ghost"
                onClick={() => {
                  setKey("");
                  setApiKey(null);
                  setTestResult(null);
                  onChange?.();
                }}
              >
                ניקוי
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LLMSettings;
