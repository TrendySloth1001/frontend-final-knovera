import React from 'react';

interface ImageStackProps {
    images?: string[];
    limit?: number;
    size?: number;
}

/**
 * ImageStack Component
 * A reusable component that displays a group of overlapping images.
 */
const ImageStack: React.FC<ImageStackProps> = ({
    images = [],
    limit = 5,
    size = 24
}) => {
    const displayCount = Math.min(images.length, limit);
    const remainingCount = images.length - limit;
    const showRemaining = remainingCount > 0;
    const visibleImages = images.slice(0, displayCount);

    return (
        <div className="flex items-center">
            <div className="flex -space-x-2">
                {visibleImages.map((src, index) => (
                    <div
                        key={index}
                        className="relative transition-transform duration-200 hover:-translate-y-1 hover:z-30"
                        style={{
                            width: size,
                            height: size,
                            zIndex: limit - index
                        }}
                    >
                        <img
                            className="rounded-full ring-2 ring-black object-cover w-full h-full shadow-md bg-zinc-800"
                            src={src}
                            alt={`User ${index + 1}`}
                            onError={(e) => {
                                // Fallback to placeholder if image fails
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${index + 1}&background=random&color=fff`;
                            }}
                        />
                    </div>
                ))}

                {showRemaining && (
                    <div
                        className="relative flex items-center justify-center rounded-full bg-zinc-800 ring-2 ring-black shadow-md transition-transform duration-200 hover:-translate-y-1 hover:z-40 cursor-pointer"
                        style={{
                            width: size,
                            height: size,
                            zIndex: 0
                        }}
                    >
                        <span className="text-[10px] font-bold text-zinc-300">
                            +{remainingCount}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageStack;
