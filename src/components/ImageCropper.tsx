'use client';

import { useState, useRef, useEffect } from 'react';

// Standard gallery aspect ratio (4:3 for gallery grid)
const ASPECT_RATIO = 4 / 3;

// Available categories
const availableCategories = ['Events', 'Campus', 'Students', 'Celebrations', 'Activities', 'Achievements', 'Workshops', 'Management', 'Others'];

function ImageCropper({ imageSrc, onCrop, onCancel, initialCategories = [] }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const cropAreaRef = useRef(null);
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [imageDragStart, setImageDragStart] = useState({ x: 0, y: 0 });
  const [quality, setQuality] = useState(0.92);
  const [maxWidth, setMaxWidth] = useState(1200);
  const [categories, setCategories] = useState(initialCategories);

  // Initialize image and crop area
  useEffect(() => {
    if (imageSrc && containerRef.current) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        const container = containerRef.current;
        const containerWidth = container.clientWidth - 60; // padding
        const containerHeight = container.clientHeight - 60;
        
        // Calculate initial scale to fit container
        const scaleW = (containerWidth * 0.9) / img.width;
        const scaleH = (containerHeight * 0.9) / img.height;
        const initialScale = Math.min(1, scaleW, scaleH);
        setScale(initialScale);
        
        // Calculate crop area dimensions based on aspect ratio
        const scaledWidth = img.width * initialScale;
        const scaledHeight = img.height * initialScale;
        
        // Crop area should be 80% of container or image, whichever is smaller
        const cropWidth = Math.min(containerWidth * 0.8, scaledWidth * 0.9);
        const cropHeight = cropWidth / ASPECT_RATIO; // Maintain aspect ratio
        
        // Center crop area
        const cropX = (containerWidth - cropWidth) / 2;
        const cropY = (containerHeight - cropHeight) / 2;
        
        setCropArea({
          x: cropX,
          y: cropY,
          width: cropWidth,
          height: cropHeight
        });
        
        // Center image
        setPosition({
          x: (containerWidth - scaledWidth) / 2,
          y: (containerHeight - scaledHeight) / 2
        });
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  // Handle mouse down on image
  const handleImageMouseDown = (e) => {
    // Don't drag image if clicking on crop area
    if (e.target.closest('.image-cropper-crop-area')) {
      return;
    }
    setIsDraggingImage(true);
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    setImageDragStart({
      x: e.clientX - position.x - rect.left,
      y: e.clientY - position.y - rect.top
    });
  };

  // Handle mouse move for dragging image
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingImage && containerRef.current && imageRef.current) {
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        const img = imageRef.current;
        
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        let newX = e.clientX - imageDragStart.x - rect.left;
        let newY = e.clientY - imageDragStart.y - rect.top;
        
        // Constrain image within container bounds
        const maxX = rect.width - scaledWidth;
        const maxY = rect.height - scaledHeight;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingImage(false);
    };

    if (isDraggingImage) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingImage, imageDragStart, scale]);

  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [cropDragStart, setCropDragStart] = useState({ x: 0, y: 0 });

  // Handle crop area drag
  const handleCropAreaMouseDown = (e) => {
    e.stopPropagation();
    setIsDraggingCrop(true);
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    setCropDragStart({
      x: e.clientX - cropArea.x - rect.left,
      y: e.clientY - cropArea.y - rect.top
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingCrop && containerRef.current) {
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        
        let newX = e.clientX - cropDragStart.x - rect.left;
        let newY = e.clientY - cropDragStart.y - rect.top;
        
        // Constrain crop area within container
        newX = Math.max(0, Math.min(newX, rect.width - cropArea.width));
        newY = Math.max(0, Math.min(newY, rect.height - cropArea.height));
        
        setCropArea(prev => ({
          ...prev,
          x: newX,
          y: newY
        }));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingCrop(false);
    };

    if (isDraggingCrop) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingCrop, cropDragStart, cropArea.width, cropArea.height]);

  const handleCategoryToggle = (category) => {
    setCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleCrop = () => {
    // Validate categories
    if (!categories || categories.length === 0) {
      alert('Please select at least one category before saving.');
      return;
    }

    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    // Calculate the source rectangle from the image
    // Convert crop area coordinates to image coordinates
    const scaleX = img.width / (img.width * scale);
    const scaleY = img.height / (img.height * scale);
    
    // Calculate source rectangle in original image coordinates
    const sourceX = (cropArea.x - position.x) * scaleX;
    const sourceY = (cropArea.y - position.y) * scaleY;
    const sourceWidth = cropArea.width * scaleX;
    const sourceHeight = cropArea.height * scaleY;
    
    // Ensure we're within image bounds
    const finalSourceX = Math.max(0, Math.min(sourceX, img.width));
    const finalSourceY = Math.max(0, Math.min(sourceY, img.height));
    const finalSourceWidth = Math.min(sourceWidth, img.width - finalSourceX);
    const finalSourceHeight = Math.min(sourceHeight, img.height - finalSourceY);
    
    // Set canvas dimensions based on max width while maintaining aspect ratio
    const outputWidth = Math.min(maxWidth, cropArea.width * scaleX);
    const outputHeight = outputWidth / ASPECT_RATIO;
    
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // Draw cropped and resized image
    ctx.drawImage(
      img,
      finalSourceX, finalSourceY, finalSourceWidth, finalSourceHeight,
      0, 0, outputWidth, outputHeight
    );

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob && onCrop) {
        // Pass blob and categories to parent
        onCrop(blob, categories);
      }
    }, 'image/jpeg', quality);
  };

  const scaledImageWidth = imageRef.current ? imageRef.current.width * scale : 0;
  const scaledImageHeight = imageRef.current ? imageRef.current.height * scale : 0;

  return (
    <div className="image-cropper-modal">
      <div className="image-cropper-content">
        <div className="image-cropper-header">
          <h3>Crop & Resize Image</h3>
          <button type="button" onClick={onCancel} className="image-cropper-close">×</button>
        </div>
        
        <div className="image-cropper-body">
          <div 
            className="image-cropper-preview-container" 
            ref={containerRef}
            onMouseDown={handleImageMouseDown}
            style={{ cursor: isDraggingImage ? 'grabbing' : 'default', userSelect: 'none' }}
          >
            {imageSrc && imageRef.current && (
              <>
                <div 
                  className="image-cropper-preview"
                  style={{
                    position: 'absolute',
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    width: `${scaledImageWidth}px`,
                    height: `${scaledImageHeight}px`
                  }}
                >
                  <img
                    src={imageSrc}
                    alt="Preview"
                    draggable={false}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
                
                {/* Crop Area Overlay */}
                <div
                  ref={cropAreaRef}
                  className="image-cropper-crop-area"
                  style={{
                    position: 'absolute',
                    left: `${cropArea.x}px`,
                    top: `${cropArea.y}px`,
                    width: `${cropArea.width}px`,
                    height: `${cropArea.height}px`,
                    cursor: 'move'
                  }}
                  onMouseDown={handleCropAreaMouseDown}
                >
                  <div className="image-cropper-crop-handles">
                    <div className="crop-handle crop-handle-nw"></div>
                    <div className="crop-handle crop-handle-ne"></div>
                    <div className="crop-handle crop-handle-sw"></div>
                    <div className="crop-handle crop-handle-se"></div>
                  </div>
                </div>
                
                {/* Dark overlay outside crop area */}
                <div className="image-cropper-overlay">
                  <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                    <defs>
                      <mask id="crop-mask">
                        <rect width="100%" height="100%" fill="white" />
                        <rect 
                          x={cropArea.x} 
                          y={cropArea.y} 
                          width={cropArea.width} 
                          height={cropArea.height} 
                          fill="black" 
                        />
                      </mask>
                    </defs>
                    <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#crop-mask)" />
                  </svg>
                </div>
              </>
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <div className="image-cropper-controls">
          {/* Category Selection */}
          <div className="image-cropper-control-group">
            <label>
              Categories <span style={{ color: '#e74c3c' }}>*</span>
              {categories.length === 0 && (
                <span style={{ color: '#e74c3c', fontSize: '12px', marginLeft: '10px' }}>
                  (Select at least one)
                </span>
              )}
            </label>
            <div className="admin-category-checkboxes image-cropper-categories">
              {availableCategories.map(cat => (
                <label key={cat} className="admin-category-checkbox-label">
                  <input
                    type="checkbox"
                    checked={categories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="image-cropper-control-group">
            <label>Zoom: {Math.round(scale * 100)}%</label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
            />
          </div>

          <div className="image-cropper-control-group">
            <label>Max Output Width (px):</label>
            <input
              type="number"
              min="400"
              max="2000"
              step="100"
              value={maxWidth}
              onChange={(e) => setMaxWidth(parseInt(e.target.value) || 1200)}
            />
          </div>

          <div className="image-cropper-control-group">
            <label>Quality: {Math.round(quality * 100)}%</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.01"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
            />
          </div>

          <div className="image-cropper-preview-info">
            {imageRef.current && (
              <>
                Original: {imageRef.current.width} × {imageRef.current.height}px
                <br />
                Crop Size: {Math.round(cropArea.width * (imageRef.current.width / scaledImageWidth))} × {Math.round(cropArea.height * (imageRef.current.height / scaledImageHeight))}px
                <br />
                Output: {maxWidth} × {Math.round(maxWidth / ASPECT_RATIO)}px (Aspect Ratio: 4:3)
              </>
            )}
          </div>
          
          <div className="image-cropper-buttons">
            <button type="button" onClick={onCancel} className="admin-btn--cancel">
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handleCrop} 
              className="admin-btn--save"
              disabled={categories.length === 0}
              style={{ opacity: categories.length === 0 ? 0.5 : 1, cursor: categories.length === 0 ? 'not-allowed' : 'pointer' }}
            >
              Crop & Save
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageCropper;
