module.exports = {
  darkMode: "class",
  presets: [require("nativewind/preset")],
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        iron: {
          bg: "rgb(var(--iron-bg) / <alpha-value>)",
          surface: "rgb(var(--iron-surface) / <alpha-value>)",
          card: "rgb(var(--iron-card) / <alpha-value>)",
          line: "rgb(var(--iron-line) / <alpha-value>)",
          strongLine: "rgb(var(--iron-strongLine) / <alpha-value>)",
          text: "rgb(var(--iron-text) / <alpha-value>)",
          muted: "rgb(var(--iron-muted) / <alpha-value>)",
          subtle: "rgb(var(--iron-subtle) / <alpha-value>)",
          primary: "rgb(var(--iron-primary) / <alpha-value>)",
          primaryPressed: "rgb(var(--iron-primaryPressed) / <alpha-value>)",
          success: "rgb(var(--iron-success) / <alpha-value>)",
          successPressed: "rgb(var(--iron-successPressed) / <alpha-value>)",
          successSoft: "rgb(var(--iron-successSoft) / <alpha-value>)",
          successText: "rgb(var(--iron-successText) / <alpha-value>)",
          warning: "rgb(var(--iron-warning) / <alpha-value>)",
          warningPressed: "rgb(var(--iron-warningPressed) / <alpha-value>)",
          warningSoft: "rgb(var(--iron-warningSoft) / <alpha-value>)",
          warningText: "rgb(var(--iron-warningText) / <alpha-value>)",
          info: "rgb(var(--iron-info) / <alpha-value>)",
          infoPressed: "rgb(var(--iron-infoPressed) / <alpha-value>)",
          infoSoft: "rgb(var(--iron-infoSoft) / <alpha-value>)",
          infoText: "rgb(var(--iron-infoText) / <alpha-value>)",
          danger: "rgb(var(--iron-danger) / <alpha-value>)",
          dangerPressed: "rgb(var(--iron-dangerPressed) / <alpha-value>)",
          dangerSoft: "rgb(var(--iron-dangerSoft) / <alpha-value>)",
          dangerText: "rgb(var(--iron-dangerText) / <alpha-value>)",
          red: "rgb(var(--iron-red) / <alpha-value>)",
          amber: "rgb(var(--iron-amber) / <alpha-value>)",
          cyan: "rgb(var(--iron-cyan) / <alpha-value>)",
          green: "rgb(var(--iron-green) / <alpha-value>)",
          purple: "rgb(var(--iron-purple) / <alpha-value>)",
          inverseText: "rgb(var(--iron-inverseText) / <alpha-value>)"
        }
      }
    }
  },
  plugins: []
};
