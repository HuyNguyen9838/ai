import { Button } from "@/components/ui/button";
import { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ClothingItem, VALID_FILE_TYPES, MAX_FILE_SIZE } from "@shared/schema";
import { cn, formatFileSize } from "@/lib/utils";
import { ArrowRight, Upload, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface UploadSectionProps {
  onItemCreated: (item: ClothingItem) => void;
  processingItem?: ClothingItem;
  onItemProcessed?: (item: ClothingItem) => void;
}

export default function UploadSection({
  onItemCreated,
  processingItem,
  onItemProcessed
}: UploadSectionProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [modelType, setModelType] = useState<string>("Tự động (mặc định)");
  const [backgroundType, setBackgroundType] = useState<string>("Studio (mặc định)");
  const [promptText, setPromptText] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          // Don't set Content-Type, it's set automatically for FormData
        },
      });
      return response.json();
    },
    onSuccess: (data: ClothingItem) => {
      toast({
        title: "Tải lên thành công",
        description: "Ảnh đã được tải lên thành công!",
      });
      onItemCreated(data);
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể tải lên ảnh. Vui lòng thử lại.",
        variant: "destructive",
      });
      console.error("Upload error:", error);
    }
  });

  // Generate mutation
  const generateMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/generate/${id}`, {
        method: "POST"
      });
      return response.json();
    },
    onSuccess: (data: ClothingItem) => {
      if (onItemProcessed) {
        onItemProcessed(data);
      }
      
      toast({
        title: "Tạo hình thành công",
        description: "Hình ảnh AI đã được tạo thành công!",
      });
    },
    onError: (error: any) => {
      // Extract detailed error message if available
      let errorMessage = "Không thể tạo hình ảnh. Vui lòng thử lại.";
      
      // Try to get more specific error details
      if (error?.response) {
        try {
          // Parse the error response if it exists
          const responseData = error.response.data;
          if (responseData?.error) {
            errorMessage = `Lỗi Gemini API: ${responseData.error}`;
          }
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
      }
      
      toast({
        title: "Lỗi tạo hình ảnh",
        description: errorMessage,
        variant: "destructive",
      });
      
      console.error("Generate error:", error);
    }
  });

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    // Validate file type
    if (!VALID_FILE_TYPES.includes(file.type)) {
      toast({
        title: "File không hợp lệ",
        description: "Chỉ chấp nhận file JPG hoặc PNG.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File quá lớn",
        description: `Kích thước tối đa là ${formatFileSize(MAX_FILE_SIZE)}.`,
        variant: "destructive",
      });
      return;
    }
    
    setFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [toast]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': []
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false
  });

  const handleUpload = () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("modelType", modelType);
    formData.append("backgroundType", backgroundType);
    formData.append("promptText", promptText);
    
    uploadMutation.mutate(formData);
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
  };

  // Start progress animation when processing
  useEffect(() => {
    if (processingItem) {
      setProgress(0);
      
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
      
      // Simulate progress with counter
      progressIntervalRef.current = window.setInterval(() => {
        setProgress(prev => {
          // Cap at 90% until the actual result comes back
          const newProgress = prev + (90 - prev) / 20;
          return Math.min(newProgress, 90);
        });
      }, 200);
      
      // Start the generation process
      generateMutation.mutate(processingItem.id);
    }
    
    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
  }, [processingItem]);

  // When generation completes
  useEffect(() => {
    if (generateMutation.isSuccess) {
      setProgress(100);
      
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    }
  }, [generateMutation.isSuccess]);

  return (
    <section id="upload-section" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Tải ảnh sản phẩm của bạn</h2>
          
          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            {/* Empty State - File Upload */}
            {!file && !processingItem && (
              <div 
                {...getRootProps()} 
                className={cn(
                  "border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragActive && "border-blue-500 bg-blue-50"
                )}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Kéo & thả ảnh sản phẩm của bạn vào đây
                </h3>
                <p className="text-gray-500 mb-4">hoặc</p>
                <Button 
                  type="button" 
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Chọn tệp
                </Button>
                <p className="text-sm text-gray-500 mt-4">Hỗ trợ JPG, PNG (tối đa 10MB)</p>
              </div>
            )}
            
            {/* Preview State */}
            {file && preview && !processingItem && (
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="bg-gray-100 rounded-lg overflow-hidden w-full md:w-1/2 aspect-square flex items-center justify-center relative">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-w-full max-h-full object-contain" 
                  />
                </div>
                
                <div className="w-full md:w-1/2 space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">{file.name}</h3>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Tùy chọn:</h4>
                    
                    {/* Model Selection */}
                    <div>
                      <Label htmlFor="model-type" className="block text-sm font-medium text-gray-700 mb-1">
                        Kiểu mẫu
                      </Label>
                      <Select
                        value={modelType}
                        onValueChange={setModelType}
                      >
                        <SelectTrigger id="model-type" className="w-full">
                          <SelectValue placeholder="Chọn kiểu mẫu" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tự động (mặc định)">Tự động (mặc định)</SelectItem>
                          <SelectItem value="Nữ - Dáng cao">Nữ - Dáng cao</SelectItem>
                          <SelectItem value="Nữ - Dáng trung bình">Nữ - Dáng trung bình</SelectItem>
                          <SelectItem value="Nam - Dáng cao">Nam - Dáng cao</SelectItem>
                          <SelectItem value="Nam - Dáng trung bình">Nam - Dáng trung bình</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Background Selection */}
                    <div>
                      <Label htmlFor="background-type" className="block text-sm font-medium text-gray-700 mb-1">
                        Nền
                      </Label>
                      <Select
                        value={backgroundType}
                        onValueChange={setBackgroundType}
                      >
                        <SelectTrigger id="background-type" className="w-full">
                          <SelectValue placeholder="Chọn loại nền" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Studio (mặc định)">Studio (mặc định)</SelectItem>
                          <SelectItem value="Ngoài trời">Ngoài trời</SelectItem>
                          <SelectItem value="Đô thị">Đô thị</SelectItem>
                          <SelectItem value="Thiên nhiên">Thiên nhiên</SelectItem>
                          <SelectItem value="Trung tính">Trung tính</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Prompt Input */}
                    <div>
                      <Label htmlFor="prompt-text" className="block text-sm font-medium text-gray-700 mb-1">
                        Lệnh yêu cầu AI
                      </Label>
                      <textarea
                        id="prompt-text"
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        placeholder="Nhập yêu cầu của bạn cho AI. Ví dụ: Mẫu nữ tóc nâu mặc áo này, đứng trên bãi biển với ánh hoàng hôn."
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                      />
                      <p className="text-xs text-gray-500 mt-1">Mô tả chi tiết để AI tạo ra hình ảnh chính xác hơn.</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 py-2 px-4"
                      onClick={resetForm}
                    >
                      Đổi ảnh
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={handleUpload}
                      disabled={uploadMutation.isPending}
                    >
                      {uploadMutation.isPending ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <span>Bắt đầu tạo</span>
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Processing State */}
            {processingItem && (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-6 relative">
                  <div className="w-full h-full rounded-full border-4 border-gray-200"></div>
                  <div className="w-full h-full rounded-full border-4 border-t-purple-500 animate-spin absolute top-0 left-0"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Đang xử lý...</h3>
                <p className="text-gray-600 mb-6">AI đang tạo hình ảnh mẫu người dựa trên sản phẩm của bạn</p>
                
                <div className="h-2 bg-gray-200 rounded-full max-w-md mx-auto mb-4 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-500">Quá trình này có thể mất từ 15-30 giây</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
