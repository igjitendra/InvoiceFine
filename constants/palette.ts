export type AppPalette = {
  dark: boolean;
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  muted: string;
  border: string;
  borderStrong: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  textOnPrimary: string;
  positive: string;
  warning: string;
  danger: string;
  dangerPressed: string;
  disabled: string;
  colors: string[];
};
export function createAppPalette(dark: boolean): AppPalette {
  return dark
    ? {
        dark: true,
        background: "#0B0B0D",
        surface: "#1B1B1E",
        surfaceVariant: "#27272B",
        text: "#F8F8F9",
        muted: "#A8A8AF",
        border: "#303034",
        borderStrong: "#424247",
        primary: "#D93632",
        primaryPressed: "#BE2826",
        primarySoft: "#3A2222",
        textOnPrimary: "#FFFFFF",
        positive: "#4AD99A",
        warning: "#FFB84D",
        danger: "#FF626B",
        dangerPressed: "#E64952",
        disabled: "#6E6E75",
        colors: [
          "#D93632",
          "#4AD99A",
          "#FFB84D",
          "#C084FC",
          "#40C9FF",
          "#FF7AA8",
          "#A3E635",
          "#A8A8AF",
        ],
      }
    : {
        dark: false,
        background: "#F7F7F8",
        surface: "#FFFFFF",
        surfaceVariant: "#F1F1F3",
        text: "#19191B",
        muted: "#74747C",
        border: "#E5E5E8",
        borderStrong: "#D7D7DB",
        primary: "#D93632",
        primaryPressed: "#BE2826",
        primarySoft: "#FDE9E8",
        textOnPrimary: "#FFFFFF",
        positive: "#168557",
        warning: "#C77800",
        danger: "#D9363E",
        dangerPressed: "#BE2830",
        disabled: "#A2A2A8",
        colors: [
          "#D93632",
          "#168557",
          "#E99A18",
          "#7C3AED",
          "#0891B2",
          "#DB2777",
          "#65A30D",
          "#74747C",
        ],
      };
}
