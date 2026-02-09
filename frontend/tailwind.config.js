/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'calm-blue': '#E0F2FE',
                'lavender': '#F3E8FF',
                'soft-green': '#D1FAE5',
            },
        },
    },
    plugins: [],
}
