import { Anthropic } from '@anthropic-ai/sdk';

// Kiểm tra cấu trúc dữ liệu của phản hồi từ Claude API
async function main() {
  // Chỉ cần xem các types, không thực hiện request
  const client = new Anthropic({
    apiKey: "fake_key_for_inspection_only",
  });

  // Log ra các type để kiểm tra
  console.log("================ TYPES ================");
  console.log("Message type structure:");
  console.log(Anthropic.prototype.messages);
  console.log("\nContent Block types:");
  
  // In ra module để khám phá
  console.log(Anthropic);
}

main().catch(console.error);
