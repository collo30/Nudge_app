/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./index.tsx",
        "./App.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'hand': ['"Patrick Hand"', 'cursive'],
                'legible': ['"Lora"', 'Georgia', 'serif'],
                'serif-display': ['"Playfair Display"', 'serif'],
            },
            boxShadow: {
                'hard': '3px 3px 0px 0px #1e293b',
                'hard-lg': '6px 6px 0px 0px #1e293b',
            },
            animation: {
                'slide-up': 'slide-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                'fade-in': 'fade-in 0.5s ease-out forwards',
                'flash-red': 'flash-red 1.5s infinite',
                'shake': 'shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both',
                'swipe-left': 'swipe-left 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
                'swipe-right': 'swipe-right 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
            },
            keyframes: {
                'slide-up': {
                    from: { transform: 'translateY(20px)', opacity: '0' },
                    to: { transform: 'translateY(0)', opacity: '1' },
                },
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                'flash-red': {
                    '0%, 100%': { backgroundColor: 'rgba(255, 255, 255, 1)', borderColor: '#f43f5e' },
                    '50%': { backgroundColor: '#ffe4e6', borderColor: '#be123c' },
                },
                'shake': {
                    '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
                    '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
                    '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
                    '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
                },
                'swipe-left': {
                    from: { transform: 'translateX(30%)', opacity: '0' },
                    to: { transform: 'translateX(0)', opacity: '1' },
                },
                'swipe-right': {
                    from: { transform: 'translateX(-30%)', opacity: '0' },
                    to: { transform: 'translateX(0)', opacity: '1' },
                }
            },
        },
    },
    plugins: [],
}
