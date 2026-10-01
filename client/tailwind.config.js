//holds the universal colors used in everything so its easier to do it. 
//colors can be found in styles.css

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        accent: "var(--color-accent)",
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
        benign: "var(--color-benign)",
        malignant: "var(--color-malignant)",
      },
    },
  },
  plugins: [],
};