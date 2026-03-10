export default function Placeholder({ title }: { title: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 safe-area-top">
            <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                {title}
            </h1>
            <p className="text-white/40">Coming soon to Echo Player.</p>
        </div>
    );
}
