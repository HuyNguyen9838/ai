import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ClothingItem } from "@shared/schema";

export function useGenerate() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressInterval, setProgressInterval] = useState<number | null>(null);

  const startProgress = () => {
    // Clear any existing interval
    if (progressInterval) {
      window.clearInterval(progressInterval);
    }
    
    setProgress(0);
    
    // Set up a new interval to simulate progress
    const interval = window.setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          return 90; // Cap at 90% until the actual result comes back
        }
        return prev + Math.random() * 5; // Increase by 0-5% at a time
      });
    }, 300);
    
    setProgressInterval(interval);
    return interval;
  };

  const stopProgress = (success = true) => {
    if (progressInterval) {
      window.clearInterval(progressInterval);
      setProgressInterval(null);
    }
    
    setProgress(success ? 100 : 0);
  };

  const generateMutation = useMutation({
    mutationFn: async (id: number) => {
      setIsGenerating(true);
      const interval = startProgress();
      
      try {
        const response = await apiRequest("POST", `/api/generate/${id}`);
        return response.json();
      } finally {
        setIsGenerating(false);
        stopProgress(true);
      }
    },
    onSuccess: (data: ClothingItem) => {
      toast({
        title: "Generation successful",
        description: "Your AI image has been generated successfully.",
      });
    },
    onError: (error) => {
      stopProgress(false);
      toast({
        title: "Generation failed",
        description: "There was an error generating your image. Please try again.",
        variant: "destructive",
      });
      console.error("Generation error:", error);
    },
  });

  return {
    generate: generateMutation.mutate,
    isGenerating: isGenerating || generateMutation.isPending,
    data: generateMutation.data as ClothingItem | undefined,
    error: generateMutation.error,
    isSuccess: generateMutation.isSuccess,
    progress,
    reset: generateMutation.reset,
  };
}
