import { createTheme } from "@mui/material/styles";

// Professional light palette: muted blue primary, neutral greys for surfaces and text
const theme = createTheme({
  spacing: 8,
  palette: {
    mode: "light",
    primary: {
      main: "#0b5fff", // slightly softened blue for accents
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#9ca3af", // lighter neutral gray
      contrastText: "#ffffff",
    },
    background: {
      default: "#f5f6f7", // overall app background: very light gray
      paper: "#fcfdfe", // subtle off-white to reduce stark white
    },
    text: {
      primary: "#111827",
      secondary: "#4b5563",
    },
    divider: "#e9ecef", // soft divider
    info: {
      main: "#0284c7",
    },
    success: {
      main: "#16a34a",
    },
    warning: {
      main: "#f59e0b",
    },
    error: {
      main: "#dc2626",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: ["Inter", "Roboto", "Helvetica", "Arial", "sans-serif"].join(
      ","
    ),
    body1: {
      fontSize: "0.95rem",
    },
  },
  components: {
    MuiPaper: {
      defaultProps: {
        elevation: 1,
      },
      styleOverrides: {
        root: {
          // slightly stronger border + shadow for clearer elevation
          border: "1px solid rgba(15, 23, 36, 0.06)",
          backgroundColor: "#fcfdfe",
          boxShadow: "0 2px 8px rgba(16,24,40,0.06)",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 1,
      },
      styleOverrides: {
        root: {
          backgroundColor: "#fcfdfe",
          boxShadow: "0 4px 12px rgba(16,24,40,0.08)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          // give contained buttons a subtle elevation to match cards/papers
          boxShadow: "0 2px 8px rgba(16,24,40,0.06)",
          "&:active": {
            boxShadow: "0 1px 4px rgba(16,24,40,0.06)",
          },
        },
        outlined: {
          border: "1px solid rgba(15,23,36,0.06)",
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          border: "1px solid rgba(15,23,36,0.06)",
          backgroundColor: "#fcfdfe",
          boxShadow: "0 6px 20px rgba(16,24,40,0.08)",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: "1px solid rgba(15,23,36,0.06)",
          backgroundColor: "#fcfdfe",
          boxShadow: "0 6px 20px rgba(16,24,40,0.08)",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "rgba(11,95,255,0.04)",
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: "1px solid rgba(15,23,36,0.06)",
          backgroundColor: "#fcfdfe",
          boxShadow: "0 12px 40px rgba(16,24,40,0.12)",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#111827",
          boxShadow: "0 6px 18px rgba(16,24,40,0.12)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: "#eceff1",
        },
      },
    },
  },
});

export default theme;
