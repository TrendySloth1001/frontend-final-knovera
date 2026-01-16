import Image from 'next/image';

interface OverviewTabProps {
  currentIllustration: string;
  illustrations: string[];
  setCurrentIllustration: (illustration: string) => void;
}

export default function OverviewTab({
  currentIllustration,
  illustrations,
  setCurrentIllustration,
}: OverviewTabProps) {
  return (
    <>
      {/* Random Illustration */}
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        {currentIllustration && (
          <>
            <div className="relative w-full max-w-2xl aspect-square">
              <Image
                src={currentIllustration}
                alt="Dashboard Illustration"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => {
                  // If image fails to load, pick another one
                  const remaining = illustrations.filter(i => i !== currentIllustration);
                  if (remaining.length > 0) {
                    const randomIndex = Math.floor(Math.random() * remaining.length);
                    setCurrentIllustration(remaining[randomIndex]);
                  }
                }}
              />
            </div>

          </>
        )}
      </div>
    </>
  );
}
