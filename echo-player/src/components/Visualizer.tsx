import { useEffect, useRef } from "react";
import { usePlayerStore } from "../store/playerStore";

const BAR_COUNT = 32;

export default function Visualizer() {
    const { isPlaying } = usePlayerStore();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const bars: number[] = new Array(BAR_COUNT).fill(10);
        let hue = 0;

        const animate = () => {
            if (!ctx) return;

            const barWidth = (canvas.width / BAR_COUNT) * 0.8;
            const gap = (canvas.width / BAR_COUNT) * 0.2;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            bars.forEach((_, i) => {
                if (isPlaying) {
                    bars[i] = Math.max(5, bars[i] * 0.9 + Math.random() * 30);
                } else {
                    bars[i] = Math.max(2, bars[i] * 0.9);
                }

                const height = bars[i];
                const x = i * (barWidth + gap);
                const y = canvas.height - height;

                const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
                hue = (hue + 0.1) % 360;
                gradient.addColorStop(0, `hsl(${160 + i * 2}, 70%, 60%)`);
                gradient.addColorStop(1, `hsl(${180 + i * 2}, 80%, 40%)`);

                ctx.fillStyle = gradient;

                ctx.beginPath();
                ctx.roundRect(x, y, barWidth, height, [4, 4, 0, 0]);
                ctx.fill();

                // Reflection
                ctx.fillStyle = `hsl(${160 + i * 2}, 70%, 60%, 0.2)`;
                ctx.beginPath();
                ctx.roundRect(x, canvas.height, barWidth, height * 0.2, [0, 0, 4, 4]);
                ctx.fill();
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying]);

    return <canvas ref={canvasRef} className="w-full h-24" />;
}
