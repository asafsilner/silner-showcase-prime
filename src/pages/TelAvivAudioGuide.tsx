import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Compass,
  Headphones,
  List,
  LocateFixed,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import MapView from "@/components/audio-guide/MapView";
import POIDetailSheet from "@/components/audio-guide/POIDetailSheet";
import POIListSheet from "@/components/audio-guide/POIListSheet";
import { telAvivAudioGuidePOIs } from "@/data/telAvivAudioGuide";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useSpeech } from "@/hooks/useSpeech";
import { distanceMeters, formatDistance } from "@/lib/geo";

const STORAGE_KEY = "tel-aviv-audio-guide-visited";
const TRIGGER_RADIUS_M = 40;

function loadVisited(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

const TelAvivAudioGuide = () => {
  const geo = useGeolocation();
  const speech = useSpeech();

  const [tourStarted, setTourStarted] = useState(false);
  const [autoNarrate, setAutoNarrate] = useState(true);
  const [visitedIds, setVisitedIds] = useState<Set<string>>(() => loadVisited());
  const [activePoiId, setActivePoiId] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);

  const announcedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    document.title = "מורה דרך קולי: טיילת תל אביב-יפו";
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...visitedIds]));
  }, [visitedIds]);

  const markVisited = (id: string) => {
    setVisitedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const poisWithDistance = useMemo(() => {
    return telAvivAudioGuidePOIs
      .map((poi) => {
        const meters = geo.position ? distanceMeters(geo.position, poi.coords) : null;
        return { ...poi, meters, distanceLabel: meters !== null ? formatDistance(meters) : null };
      })
      .sort((a, b) => {
        if (a.meters === null && b.meters === null) return 0;
        if (a.meters === null) return 1;
        if (b.meters === null) return -1;
        return a.meters - b.meters;
      });
  }, [geo.position]);

  // Proximity-triggered narration.
  useEffect(() => {
    if (!geo.position || !autoNarrate) return;

    const nearby = poisWithDistance.find(
      (poi) => poi.meters !== null && poi.meters <= TRIGGER_RADIUS_M && !announcedRef.current.has(poi.id)
    );
    if (!nearby) return;

    announcedRef.current.add(nearby.id);
    markVisited(nearby.id);
    setActivePoiId(nearby.id);
    speech.speak(nearby.id, nearby.audio_script);
    if ("vibrate" in navigator) navigator.vibrate?.(200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.position, autoNarrate]);

  const activePoi = activePoiId ? telAvivAudioGuidePOIs.find((p) => p.id === activePoiId) ?? null : null;
  const activeDistance = activePoiId
    ? poisWithDistance.find((p) => p.id === activePoiId)?.distanceLabel ?? null
    : null;

  const handleSelectPoi = (id: string) => {
    setListOpen(false);
    setActivePoiId(id);
  };

  const handlePlay = () => {
    if (!activePoi) return;
    markVisited(activePoi.id);
    announcedRef.current.add(activePoi.id);
    speech.speak(activePoi.id, activePoi.audio_script);
  };

  const handleStartTour = () => {
    setTourStarted(true);
    geo.start();
    // A silent utterance on the first user gesture unlocks TTS on iOS Safari.
    speech.speak("__unlock__", " ");
    speech.stop();
  };

  const visitedCount = visitedIds.size;
  const total = telAvivAudioGuidePOIs.length;

  return (
    <div dir="rtl" lang="he" className="font-body fixed inset-0 z-0 bg-background text-foreground isolate">
      <MapView
        pois={telAvivAudioGuidePOIs}
        userPosition={geo.position}
        visitedIds={visitedIds}
        activePoiId={activePoiId}
        onSelectPoi={handleSelectPoi}
      />

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-[500] bg-gradient-to-b from-background/95 to-transparent pb-8 pointer-events-none">
        <div className="flex items-center justify-between gap-3 px-4 pt-4 pointer-events-auto">
          <Link
            to="/"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-card/90 border border-border backdrop-blur-sm hover:bg-accent transition-colors"
            aria-label="חזרה לאתר"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="flex-1 bg-card/90 backdrop-blur-sm border border-border rounded-full px-4 py-1.5 flex items-center gap-2">
            <Headphones className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-medium text-foreground truncate">
              {visitedCount} / {total} תחנות התגלו
            </span>
            <Progress value={(visitedCount / total) * 100} className="h-1.5 flex-1" />
          </div>

          <button
            onClick={() => setAutoNarrate((v) => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-card/90 border border-border backdrop-blur-sm hover:bg-accent transition-colors"
            aria-label={autoNarrate ? "כבה השמעה אוטומטית" : "הפעל השמעה אוטומטית"}
            title={autoNarrate ? "השמעה אוטומטית פעילה" : "השמעה אוטומטית כבויה"}
          >
            {autoNarrate ? (
              <Volume2 className="w-4 h-4 text-primary" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 inset-x-0 z-[500] bg-gradient-to-t from-background/95 to-transparent pt-10">
        <div className="flex items-center gap-3 px-4 pb-6">
          <Button onClick={() => setListOpen(true)} variant="secondary" className="gap-2 flex-1">
            <List className="w-4 h-4" /> כל התחנות
          </Button>
          {geo.status !== "active" && (
            <Button onClick={handleStartTour} className="gap-2 flex-1">
              <LocateFixed className="w-4 h-4" /> התחילו את הסיור
            </Button>
          )}
        </div>
      </div>

      {/* First-visit intro */}
      {!tourStarted && (
        <div className="absolute inset-0 z-[600] bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center px-8 text-center">
          <Compass className="w-12 h-12 text-primary mb-4" />
          <h1 className="font-display text-3xl font-bold mb-3">מורה דרך קולי</h1>
          <p className="text-primary font-medium mb-6">טיילת תל אביב-יפו</p>
          <p className="text-muted-foreground leading-relaxed max-w-sm mb-8">
            הליכה עם GPS לאורך הטיילת. כשתתקרבו לנקודת ציון היסטורית, נספר לכם
            את הסיפור שלה בקול, בדיוק במקום. אפשר גם לעיין בכל התחנות בלי לזוז מהבית.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button size="lg" onClick={handleStartTour} className="gap-2">
              <LocateFixed className="w-4 h-4" /> התחילו עם מיקום חי
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setTourStarted(true);
                setListOpen(true);
              }}
            >
              עיינו בתחנות בלי GPS
            </Button>
          </div>
          {geo.status === "denied" && (
            <p className="text-xs text-destructive mt-4 max-w-xs">
              הגישה למיקום נחסמה. אפשר עדיין לעיין בכל התחנות ולהשמיע את הסיפורים ידנית.
            </p>
          )}
        </div>
      )}

      <POIDetailSheet
        poi={activePoi}
        distanceLabel={activeDistance}
        isVisited={activePoiId ? visitedIds.has(activePoiId) : false}
        isSpeaking={speech.speaking && speech.speakingId === activePoiId}
        isPaused={speech.paused}
        onOpenChange={(open) => {
          if (!open) {
            setActivePoiId(null);
            speech.stop();
          }
        }}
        onPlay={handlePlay}
        onTogglePause={speech.togglePause}
        onStop={speech.stop}
      />

      <POIListSheet
        open={listOpen}
        onOpenChange={setListOpen}
        pois={poisWithDistance}
        visitedIds={visitedIds}
        onSelectPoi={handleSelectPoi}
      />
    </div>
  );
};

export default TelAvivAudioGuide;
