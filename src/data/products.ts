import { MockDbService } from "@/services/mockDb";

// Chỉ giữ duy nhất một khai báo bắc cầu sang Database Engine, xóa bỏ hoàn toàn mảng tĩnh cũ
export const MOCK_CATALOG_PRODUCTS = MockDbService.getProducts();