import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Paperclip, SkipForward } from "lucide-react";
import type { Answer, Question } from "@/advisor/types";

interface QuestionCardProps {
  question: Question;
  onAnswer: (value: Answer["value"], skipped?: boolean) => void;
}

/**
 * Renders one interview question with the input widget matching its type:
 * single/multi choice, slider, tap-to-rank, free text or file upload.
 */
const QuestionCard = ({ question, onAnswer }: QuestionCardProps) => {
  const [multiSelection, setMultiSelection] = useState<string[]>([]);
  const [ranking, setRanking] = useState<string[]>([]);
  const [sliderValue, setSliderValue] = useState<number>(
    question.slider ? Math.round((question.slider.min + question.slider.max) / 2) : 0,
  );
  const [text, setText] = useState("");
  const [fileNames, setFileNames] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggle = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  const renderInput = () => {
    switch (question.type) {
      case "single-choice":
        return (
          <div className="grid gap-2">
            {question.options?.map((opt) => (
              <Button
                key={opt.id}
                variant="outline"
                className="justify-start h-auto py-3 text-right whitespace-normal"
                onClick={() => onAnswer([opt.id])}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        );

      case "multi-choice":
        return (
          <div className="space-y-3">
            <div className="grid gap-2">
              {question.options?.map((opt) => {
                const selected = multiSelection.includes(opt.id);
                return (
                  <Button
                    key={opt.id}
                    variant={selected ? "default" : "outline"}
                    className="justify-start h-auto py-3 text-right whitespace-normal"
                    onClick={() => setMultiSelection((s) => toggle(s, opt.id))}
                  >
                    {opt.label}
                  </Button>
                );
              })}
            </div>
            <Button className="w-full" onClick={() => onAnswer(multiSelection)}>
              המשך {multiSelection.length > 0 ? `(${multiSelection.length} נבחרו)` : "(ללא בחירה)"}
            </Button>
          </div>
        );

      case "ranking":
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              לחצו על המשימות לפי הסדר — הראשונה שתבחרו היא הגוזלת הכי הרבה זמן.
            </p>
            <div className="grid gap-2">
              {question.options?.map((opt) => {
                const index = ranking.indexOf(opt.id);
                return (
                  <Button
                    key={opt.id}
                    variant={index >= 0 ? "default" : "outline"}
                    className="justify-start h-auto py-3 text-right whitespace-normal gap-3"
                    onClick={() => setRanking((r) => toggle(r, opt.id))}
                  >
                    {index >= 0 && <Badge variant="secondary">{index + 1}</Badge>}
                    {opt.label}
                  </Button>
                );
              })}
            </div>
            <Button className="w-full" disabled={ranking.length === 0} onClick={() => onAnswer(ranking)}>
              סיימתי לדרג ({ranking.length})
            </Button>
          </div>
        );

      case "slider": {
        const s = question.slider!;
        return (
          <div className="space-y-4">
            <div className="text-center text-3xl font-bold text-primary">{sliderValue}</div>
            <Slider
              dir="rtl"
              min={s.min}
              max={s.max}
              step={s.step}
              value={[sliderValue]}
              onValueChange={([v]) => setSliderValue(v)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{s.minLabel}</span>
              <span>{s.maxLabel}</span>
            </div>
            <Button className="w-full" onClick={() => onAnswer(sliderValue)}>
              המשך
            </Button>
          </div>
        );
      }

      case "open-text":
        return (
          <div className="space-y-3">
            <Textarea
              dir="rtl"
              rows={4}
              placeholder="כתבו בחופשיות..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button className="w-full" disabled={text.trim().length === 0} onClick={() => onAnswer(text.trim())}>
              שליחה
            </Button>
          </div>
        );

      case "file-upload":
      case "screenshot":
      case "audio-note":
        return (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,audio/*,.pdf,.doc,.docx,.xlsx,.csv,.txt"
              className="hidden"
              onChange={(e) =>
                setFileNames(Array.from(e.target.files ?? []).map((f) => f.name))
              }
            />
            <Button variant="outline" className="w-full gap-2" onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="w-4 h-4" />
              בחירת קבצים (מסמך, צילום מסך או הקלטה)
            </Button>
            {fileNames.length > 0 && (
              <p className="text-sm text-muted-foreground">נבחרו: {fileNames.join(", ")}</p>
            )}
            <Button className="w-full" disabled={fileNames.length === 0} onClick={() => onAnswer(fileNames)}>
              צירוף והמשך
            </Button>
          </div>
        );
    }
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card dir="rtl">
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">
            {question.isClarification && <Badge className="ml-2">שאלת הבהרה</Badge>}
            {question.text}
          </CardTitle>
          {question.hint && <p className="text-sm text-muted-foreground">{question.hint}</p>}
        </CardHeader>
        <CardContent className="space-y-4">
          {renderInput()}
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-muted-foreground"
            onClick={() => onAnswer([], true)}
          >
            <SkipForward className="w-4 h-4" />
            דילוג על השאלה
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuestionCard;
