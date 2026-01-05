import { useRef, useEffect } from 'react';
import './VectorVisualizer.css';

interface VectorVisualizerProps {
    data: number[];
    compareTo?: number[];
}

export function VectorVisualizer({ data, compareTo }: VectorVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        drawVisualization();
    }, [data, compareTo]);

    const calculateMagnitude = (vec: number[]) => {
        return Math.sqrt(vec.reduce((acc, val) => acc + val * val, 0));
    };

    const calculateDotProduct = (vecA: number[], vecB: number[]) => {
        return vecA.reduce((acc, val, i) => acc + val * (vecB[i] || 0), 0);
    };

    const drawVisualization = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Fix blurry canvas by using device pixel ratio
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        if (!data || data.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('No vector data available', width / 2, height / 2);
            return;
        }

        const barWidth = width / data.length;

        // Auto-scale
        let maxVal = 0;
        data.forEach(v => maxVal = Math.max(maxVal, Math.abs(v)));
        if (compareTo) {
            compareTo.forEach(v => maxVal = Math.max(maxVal, Math.abs(v)));
        }

        const scale = maxVal > 0 ? 1 / maxVal : 1;

        data.forEach((value, index) => {
            const x = index * barWidth;
            const normalizedValue = value * scale;

            // Draw current vector (solid)
            if (value > 0) {
                const intensity = Math.min(1, Math.abs(normalizedValue));
                ctx.fillStyle = `rgba(59, 130, 246, ${intensity})`; // Blue
                const barHeight = (height / 2) * intensity;
                ctx.fillRect(x, height / 2 - barHeight, barWidth, barHeight);
            } else {
                const intensity = Math.min(1, Math.abs(normalizedValue));
                ctx.fillStyle = `rgba(239, 68, 68, ${intensity})`; // Red
                const barHeight = (height / 2) * intensity;
                ctx.fillRect(x, height / 2, barWidth, barHeight);
            }

        });

        // Draw center line
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
    };

    const positiveCount = data.filter(v => v > 0).length;
    const negativeCount = data.filter(v => v < 0).length;
    
    const magA = calculateMagnitude(data);
    const magB = compareTo ? calculateMagnitude(compareTo) : 0;
    const dotProduct = compareTo ? calculateDotProduct(data, compareTo) : 0;
    const cosineSim = (magA > 0 && magB > 0) ? dotProduct / (magA * magB) : 0;

    return (
        <div className="vector-visualizer">
            <div className="viz-canvas-container">
                <canvas
                    ref={canvasRef}
                    style={{ width: '100%', height: '80px', display: 'block' }}
                />
            </div>

            <div className="vector-info">
                <span>Dimensions: {data.length}</span>
                <span className="vector-legend">
                    <span className="legend-item"><span className="dot positive"></span> Pos: {positiveCount}</span>
                    <span className="legend-item"><span className="dot negative"></span> Neg: {negativeCount}</span>
                </span>
            </div>

            {/* {compareTo && (
                <div className="similarity-display">
                    <span className="similarity-label">Similarity:</span>
                    <span className="similarity-value">{(cosineSim * 100).toFixed(1)}%</span>
                    <span className="similarity-indicator">
                        {cosineSim >= 0.8 ? 'High' : cosineSim >= 0.5 ? 'Medium' : 'Low'}
                    </span>
                </div>
            )} */}
        </div>
    );
}
