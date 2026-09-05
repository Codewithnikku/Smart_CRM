export default {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        container: {
            center: true,
        },
        extend: {
            colors: {
                brand: {
                    50: "#eef0fb",
                    100: "#dfe2f4",
                    200: "#bfc5e9",
                    300: "#969fd8",
                    400: "#6b75c1",
                    500: "#4c54ab",
                    600: "#3B3486",
                    700: "#342e6c",
                    800: "#2d2858",
                    900: "#28254a",
                    950: "#17152c",
                },
                accent: {
                    50: "#e7f7f7",
                    100: "#cdecec",
                    200: "#9fd9d9",
                    300: "#65bfc0",
                    400: "#38a0a2",
                    500: "#0E8388",
                    600: "#0c6a70",
                    700: "#0e5559",
                    800: "#114448",
                    900: "#12393c",
                    950: "#072022",
                },
                ink: {
                    50: "#f8f8f6",
                    100: "#efede7",
                    200: "#dcd8ce",
                    300: "#c4bdae",
                    400: "#a89e8a",
                    500: "#908672",
                    600: "#7b7262",
                    700: "#665e52",
                    800: "#554f45",
                    900: "#47423b",
                    950: "#26231e",
                },
            },
            fontFamily: {
                display: ['"DM Serif Display"', "serif"],
                sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
            },
            boxShadow: {
                soft: "0 4px 24px -8px rgba(59, 52, 134, 0.15)",
                glow: "0 0 40px -10px rgba(14, 131, 136, 0.35)",
            },
            backgroundImage: {
                "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")",
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out",
                "slide-up": "slideUp 0.5s ease-out",
                "stagger": "stagger 0.6s ease-out both",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(16px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                stagger: {
                    "0%": { opacity: "0", transform: "translateY(12px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
        },
    },
    plugins: [],
};
