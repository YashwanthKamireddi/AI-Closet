import { cn } from "@/lib/utils";
import { moodTypes } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  SmilePlus, 
  BadgeCheck, 
  Sparkles, 
  Coffee, 
  Heart, 
  Briefcase, 
  Palette 
} from "lucide-react";

interface MoodSelectorProps {
  selectedMood: string;
  setSelectedMood: (mood: string) => void;
}

export default function MoodSelector({ selectedMood, setSelectedMood }: MoodSelectorProps) {
  // Map mood types to icons
  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "happy": return <SmilePlus className="h-6 w-6" />;
      case "confident": return <BadgeCheck className="h-6 w-6" />;
      case "relaxed": return <Coffee className="h-6 w-6" />;
      case "energetic": return <Sparkles className="h-6 w-6" />;
      case "romantic": return <Heart className="h-6 w-6" />;
      case "professional": return <Briefcase className="h-6 w-6" />;
      case "creative": return <Palette className="h-6 w-6" />;
      default: return <SmilePlus className="h-6 w-6" />;
    }
  };

  // Define vibrant gradient backgrounds for each mood
  const getMoodGradient = (mood: string): string => {
    switch (mood) {
      case "happy": return "from-yellow-500 to-orange-500";
      case "confident": return "from-blue-500 to-indigo-600";
      case "relaxed": return "from-teal-400 to-teal-600";
      case "energetic": return "from-red-500 to-pink-600";
      case "romantic": return "from-pink-400 to-purple-500";
      case "professional": return "from-slate-500 to-gray-700";
      case "creative": return "from-purple-400 to-violet-600";
      default: return "from-primary to-primary/80";
    }
  };

  // Map mood types to descriptions
  const getMoodDescription = (mood: string): string => {
    switch (mood) {
      case "happy": return "Bright, colorful outfits to match your upbeat mood";
      case "confident": return "Bold, striking choices to make a statement";
      case "relaxed": return "Comfortable, laid-back pieces for effortless style";
      case "energetic": return "Dynamic looks to keep up with your active day";
      case "romantic": return "Soft, feminine pieces for a dreamy aesthetic";
      case "professional": return "Polished, refined outfits for a commanding presence";
      case "creative": return "Unique, artistic combinations to express yourself";
      default: return "Select a mood for personalized recommendations";
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {moodTypes.map((mood) => (
          <Button
            key={mood.value}
            variant="ghost"
            className={cn(
              "flex flex-col items-center justify-center h-20 gap-1 p-0 transition-all",
              selectedMood === mood.value && 
                "bg-gradient-to-br animate-pulse shadow-lg scale-105 border-none",
              selectedMood === mood.value && getMoodGradient(mood.value)
            )}
            onClick={() => setSelectedMood(mood.value)}
          >
            <div className={cn(
              "p-1 rounded-full transition-transform duration-300",
              selectedMood === mood.value ? "text-white transform scale-110" : "text-muted-foreground"
            )}>
              {getMoodIcon(mood.value)}
            </div>
            <span className={cn(
              "text-xs font-medium",
              selectedMood === mood.value ? "text-white font-bold" : "text-foreground"
            )}>
              {mood.label}
            </span>
          </Button>
        ))}
      </div>

      <div className={cn(
        "p-3 rounded-lg bg-gradient-to-br shadow-md transform transition-all duration-300",
        selectedMood && "translate-y-0 opacity-100",
        !selectedMood && "translate-y-2 opacity-90",
        getMoodGradient(selectedMood)
      )}>
        <p className="text-white text-sm font-medium">
          {getMoodDescription(selectedMood)}
        </p>
      </div>
    </div>
  );
}