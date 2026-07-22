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

/**
 * English-facing BYO-key dialog for the Character Studio. Shares the
 * same localStorage-backed config as the AI Advisor, so a key entered
 * in either place powers both features.
 */

const MODEL_LABELS: Record<string, string> = {
  "claude-opus-4-8": "Claude Opus 4.8 — smartest (default)",
  "claude-sonnet-5": "Claude Sonnet 5 — fast & balanced",
  "claude-haiku-4-5": "Claude Haiku 4.5 — fastest & cheapest",
};

interface StudioSettingsProps {
  onChange?: () => void;
}

const StudioSettings = ({ onChange }: StudioSettingsProps) => {
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
          <Settings2 className="h-4 w-4" />
          Model connection
          {isLLMConfigured() ? (
            <Badge className="gap-1"><Cpu className="h-3 w-3" /> Live</Badge>
          ) : (
            <Badge variant="secondary">Demo</Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect to the Claude API</DialogTitle>
          <DialogDescription>
            With an API key the studio runs live: Claude sees your sketch,
            enhances your prompt as you type and writes the full character
            sheet. Without one, everything still works on the built-in rule
            engine.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studio-api-key">Anthropic API key</Label>
            <Input
              id="studio-api-key"
              type="password"
              placeholder="sk-ant-..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Stored only in this browser (localStorage) and sent directly to
              Anthropic — no other server ever sees it. Get a key at
              console.anthropic.com.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={model} onValueChange={setModelState}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {MODEL_LABELS[m.id] ?? m.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {testResult && (
            <p
              className={`flex items-center gap-2 text-sm ${testResult.ok ? "text-primary" : "text-destructive"}`}
            >
              {testResult.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {testResult.message}
            </p>
          )}
          <div className="flex gap-2">
            <Button onClick={save} className="flex-1">
              Save
            </Button>
            <Button variant="outline" onClick={runTest} disabled={testing || !key.trim()}>
              {testing ? "Testing…" : "Test connection"}
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
                Clear
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudioSettings;
