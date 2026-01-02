import { useState, useRef, useEffect } from "react";
import { RotateCcw, Play, Pause, Video, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface Product360ViewProps {
  images: string[];
  productName: string;
  videoUrl?: string;
}

const Product360View = ({ images, productName, videoUrl }: Product360ViewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-rotate effect
  useEffect(() => {
    if (isAutoRotating && images.length > 1) {
      autoRotateRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % images.length);
      }, 500);
    }
    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, [isAutoRotating, images.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (images.length <= 1) return;
    setIsDragging(true);
    setStartX(e.clientX);
    setIsAutoRotating(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || images.length <= 1) return;
    
    const diff = e.clientX - startX;
    const threshold = 30; // pixels to trigger image change
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
      } else {
        setCurrentIndex(prev => (prev + 1) % images.length);
      }
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (images.length <= 1) return;
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setIsAutoRotating(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || images.length <= 1) return;
    
    const diff = e.touches[0].clientX - startX;
    const threshold = 30;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
      } else {
        setCurrentIndex(prev => (prev + 1) % images.length);
      }
      setStartX(e.touches[0].clientX);
    }
  };

  if (images.length <= 1 && !videoUrl) return null;

  return (
    <div className="space-y-3">
      {/* 360° View Controls */}
      {images.length > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className="gap-2"
          >
            <RotateCcw className={`h-4 w-4 ${isAutoRotating ? 'animate-spin' : ''}`} />
            {isAutoRotating ? 'Stop' : '360° View'}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Expand className="h-4 w-4" />
                Fullscreen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <div 
                className="aspect-square cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
              >
                <img
                  src={images[currentIndex]}
                  alt={`${productName} - View ${currentIndex + 1}`}
                  className="w-full h-full object-contain select-none"
                  draggable={false}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Drag left/right to rotate • {currentIndex + 1} / {images.length}
              </p>
            </DialogContent>
          </Dialog>

          {videoUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVideo(!showVideo)}
              className="gap-2"
            >
              <Video className="h-4 w-4" />
              {showVideo ? 'Hide Video' : 'Demo Video'}
            </Button>
          )}
        </div>
      )}

      {/* Interactive 360 Preview */}
      {images.length > 1 && !showVideo && (
        <div 
          ref={containerRef}
          className="relative aspect-square bg-muted rounded-lg overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          <img
            src={images[currentIndex]}
            alt={`${productName} - View ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            draggable={false}
          />
          
          {/* Rotation indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs">
            <RotateCcw className="h-3 w-3" />
            <span>Drag to rotate • {currentIndex + 1}/{images.length}</span>
          </div>

          {/* Progress dots */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <button
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-primary w-3' : 'bg-muted-foreground/50'
                }`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Video Player */}
      {showVideo && videoUrl && (
        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full object-cover"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default Product360View;
