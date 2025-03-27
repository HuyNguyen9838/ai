"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = require("@anthropic-ai/sdk");
// Kiểm tra cấu trúc dữ liệu của phản hồi từ Claude API
async function main() {
    // Chỉ cần xem các types, không thực hiện request
    const client = new sdk_1.Anthropic({
        apiKey: "fake_key_for_inspection_only",
    });
    // Log ra các type để kiểm tra
    console.log("================ TYPES ================");
    console.log("Message type structure:");
    console.log(sdk_1.Anthropic.prototype.messages);
    console.log("\nContent Block types:");
    // In ra module để khám phá
    console.log(sdk_1.Anthropic);
}
main().catch(console.error);
