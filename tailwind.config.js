export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        serif: ['Tinos', '"Times New Roman"', 'serif'],
      },
      /* Góc cứng: mọi bo góc thu về 1–4px, chỉ giữ rounded-full cho avatar/huy hiệu */
      /* Bo góc theo biến --radius (Tùy chỉnh giao diện → Bo góc); mặc định 2px. rounded-full giữ nguyên */
      borderRadius: {
        sm: 'calc(var(--radius) * 0.5)',
        DEFAULT: 'var(--radius)',
        md: 'var(--radius)',
        lg: 'calc(var(--radius) * 1.5)',
        xl: 'calc(var(--radius) * 2)',
        '2xl': 'calc(var(--radius) * 2)',
        '3xl': 'calc(var(--radius) * 2)',
      },
      colors: {
        /* Nền giấy: trắng ngà thay trắng tinh (chế độ tối: bg-white đổi sang --surface trong index.css) */
        white: '#FFFEFB',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        /* Xám ấm, ngả be — đảo chiều ở chế độ tối (giá trị trong index.css) */
        gray: {
          50: 'rgb(var(--gray-50) / <alpha-value>)',
          100: 'rgb(var(--gray-100) / <alpha-value>)',
          200: 'rgb(var(--gray-200) / <alpha-value>)',
          300: 'rgb(var(--gray-300) / <alpha-value>)',
          400: 'rgb(var(--gray-400) / <alpha-value>)',
          500: 'rgb(var(--gray-500) / <alpha-value>)',
          600: 'rgb(var(--gray-600) / <alpha-value>)',
          700: 'rgb(var(--gray-700) / <alpha-value>)',
          800: 'rgb(var(--gray-800) / <alpha-value>)',
          900: 'rgb(var(--gray-900) / <alpha-value>)',
        },
        /* Màu chủ đạo — đổi theo Tùy chỉnh giao diện → Màu chủ đạo */
        brand: {
          50: 'rgb(var(--brand-50) / <alpha-value>)',
          100: 'rgb(var(--brand-100) / <alpha-value>)',
          200: 'rgb(var(--brand-200) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
          800: 'rgb(var(--brand-800) / <alpha-value>)',
          900: 'rgb(var(--brand-900) / <alpha-value>)',
        },
        gold: {
          200: '#F6E3B0',
          300: '#F0CF7A',
          400: '#E8B94A',
          500: '#D29F2E',
        },
        success: {
          50: 'rgb(var(--success-50) / <alpha-value>)',
          200: 'rgb(var(--success-200) / <alpha-value>)',
          600: 'rgb(var(--success-600) / <alpha-value>)',
          700: 'rgb(var(--success-700) / <alpha-value>)',
        },
        warning: {
          50: 'rgb(var(--warning-50) / <alpha-value>)',
          200: 'rgb(var(--warning-200) / <alpha-value>)',
          600: 'rgb(var(--warning-600) / <alpha-value>)',
          700: 'rgb(var(--warning-700) / <alpha-value>)',
        },
      },
    },
  },
}
