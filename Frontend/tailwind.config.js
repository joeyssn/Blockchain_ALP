/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7faf9",
          100: "#eef3f1",
          200: "#d6e1dd",
          500: "#64746f",
          700: "#283936",
          900: "#111c1a",
        },
        web3: {
          50: "#eafaf2",
          400: "#38d996",
          500: "#16b978",
          600: "#0e8f5d",
          700: "#0a704b",
          900: "#073b2a",
        },
      },
      boxShadow: {
        soft: "0 18px 45px rgba(17, 28, 26, 0.08)",
      },
    },
  },
  plugins: [],
};
