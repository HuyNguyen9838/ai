import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ClothingItem } from "@shared/schema";

export function useUpload() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsUploading(true);
      try {
        const response = await apiRequest("POST", "/api/upload", undefined, {
          method: "POST",
          body: formData,
          headers: {
            // Don't set Content-Type, it's set automatically for FormData
          },
        });
        return response.json();
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: (data: ClothingItem) => {
      toast({
        title: "Upload successful",
        description: "Your image has been uploaded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image. Please try again.",
        variant: "destructive",
      });
      console.error("Upload error:", error);
    },
  });

  return {
    upload: uploadMutation.mutate,
    isUploading: isUploading || uploadMutation.isPending,
    data: uploadMutation.data as ClothingItem | undefined,
    error: uploadMutation.error,
    isSuccess: uploadMutation.isSuccess,
    reset: uploadMutation.reset,
  };
}
