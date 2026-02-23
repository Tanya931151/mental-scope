/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Calming Mental Wellness Palette
                'calm-blue': '#6CB4EE',
                'lavender': '#A291E4',
                'soft-teal': '#82C4C3',
                'gentle-pink': '#F8D7E0',
                'light-bg': '#F9FAFB',
                'soft-green': '#A8E6CF',
            },
            boxShadow: {
                '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.1)',
            },
            fontFamily: {
                'heading': ['Poppins', 'sans-serif'],
                'body': ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
