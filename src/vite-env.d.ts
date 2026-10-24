/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "1": chạy thử tại máy bằng dữ liệu mẫu, không kết nối Firebase (xem src/docs/firebase.md) */
  readonly VITE_DISABLE_FIREBASE?: string;
}
