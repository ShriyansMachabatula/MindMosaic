import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

//importing the icons
import cursorIcon from"../../img/cursor.png";
import imageIcon from "../../img/pic.png";
import eraserIcon from "../../img/eraser.png";
import textIcon from "../../img/text.png";
import scissorsIcon from "../../img/scissors.png";
import brushIcon from "../../img/brush.png"; 

/* for api handling */
import axios from "axios";

const UNSPLASH_API_URL = "https://api.unsplash.com/search/photos";
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_REACT_APP_UNSPLASH_ACCESS_KEY;

/* fabric js  */
import * as fabric from "fabric";

function Session() {
  const { sessionId } = useParams();
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const imageButtonRef = useRef(null);
  const fileInputRef = useRef(null);

  // modal state
  const [showModal, setShowModal] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);

  // for image from unsplash
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // zoom level state
  const [zoomLevel, setZoomLevel] = useState(1);

  const [isErasing, setIsErasing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false); // Drawing state

  // Brush settings state
  const [showBrushSettings, setShowBrushSettings] = useState(false); // Brush settings modal state
  const [brushSize, setBrushSize] = useState(5); // Default brush size
  const [brushColor, setBrushColor] = useState("black"); // Default brush color

  // responsible to show image modal next to the toolbar element
  useEffect(() => {
    if (showImageModal && imageButtonRef.current) {
      const toolbarRect = document
        .querySelector(".toolbar")
        ?.getBoundingClientRect();
      const buttonRect = imageButtonRef.current.getBoundingClientRect();
      const modal = document.querySelector(".image-modal");
      if (modal && toolbarRect) {
        modal.style.top = `${buttonRect.top}px`;
        modal.style.left = `${toolbarRect.right}px`;
      }
    }
  }, [showImageModal]);

  // initialize canvas using fabric js
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        backgroundColor: "white",
      });

      fabricCanvasRef.current = canvas;

      /* const text = new fabric.IText("Why she so happy!", {
        left: 50,
        top: 50,
        fontFamily: "Arial",
        fontSize: 20,
        fill: "black",
      });
      canvas.add(text); */

      return () => {
        canvas.dispose();
      };
    }
  }, []); // Initialize canvas only once

  // update eraser settings dynamically
  useEffect(() => {
    const canvas = fabricCanvasRef.current;

    canvas.off("mouse:down", handleEraser);
    console.log("isErasing state:", isErasing);
    if (fabricCanvasRef.current) {
      if (isErasing) {
        canvas.isDrawingMode = false;
        canvas.defaultCursor = "crosshair";
        canvas.on("mouse:down", handleEraser);
      } else {
        canvas.defaultCursor = "default";
      }
      canvas.requestRenderAll();
    }
  }, [isErasing]);

  // Update brush dynamically
  useEffect(() => {
    if (fabricCanvasRef.current && isDrawing) {
      const canvas = fabricCanvasRef.current;
      canvas.isDrawingMode = true;
      const brush = new fabric.PencilBrush(canvas);
      brush.color = brushColor;
      brush.width = brushSize;
      canvas.freeDrawingBrush = brush;
      canvas.requestRenderAll();
    } else if (fabricCanvasRef.current && !isDrawing) {
      const canvas = fabricCanvasRef.current;
      canvas.isDrawingMode = false;
    }
  }, [isDrawing, brushSize, brushColor]);

  // Eraser handler
  const handleEraser = (event) => {
    const canvas = fabricCanvasRef.current;

    if (!isErasing || !canvas) return;

    const target = event.target;
    if (target instanceof fabric.FabricObject) {
      canvas.remove(target); // Remove the object under the cursor
      canvas.requestRenderAll();
    }
  };

  //for image modal
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.get(UNSPLASH_API_URL, {
        params: { query: searchQuery },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      });

      setSearchResults(response.data.results);
      console.log(response.data.results);
    } catch (error) {
      console.error("Error fetching images: ", error);
    }
  };

  /* adding image to fabricjs canvas */
  const addImageToCanvas = (imageUrl) => {
    if (fabricCanvasRef.current) {
      console.log("Adding image to canvas");
      console.log(fabricCanvasRef.current);

      const canvas = fabricCanvasRef.current;
      const optimizedImageUrl = imageUrl + "?fit=crop&w=300&h=400";
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl + "?fit=crop&w=300&h=400";

      img.onload = () => {
        const oImg = new fabric.Image(img);

        try {
          oImg.scaleToWidth(200);
          canvas.add(oImg);
          canvas.centerObject(oImg);
          canvas.requestRenderAll();
          console.log("Image added successfully");
        } catch (error) {
          console.error("Error adding image to canvas: ", error);
        }
      };

      img.onerror = (err) => {
        console.error("Error preloading image:", err);
      };
    } else {
      console.log("Canvas not initialized");
    }
  };

  // Handle Image Modal
  const handleImageButtonClick = () => {
    setIsErasing(false); // Disable erasing when image modal is active
    setShowImageModal(!showImageModal);
  };

  // Toggle Erase Mode
  const toggleEraseMode = () => {
    const canvas = fabricCanvasRef.current;

    setIsErasing(!isErasing); // Toggle erasing mode
    setIsDrawing(false); // Disable drawing when erasing

    if (!isErasing) {
      canvas.off("mouse:down", handleEraser);
      canvas.defaultCursor = "default";
      canvas.requestRenderAll();
    }
  };

  /* adding text to fabricjs canvas */
  const addTextToCanvas = () => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      const text = new fabric.IText("Add your text here...", {
        left: 50,
        top: 100,
        fontFamily: "Arial",
        fontSize: 20,
        fill: "black",
        selectable: true,
        editable: true,
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.requestRenderAll();
    } else {
      console.error("Canvas not initialized");
    }
  };

  // Handle Brush Button Click
  const handleBrushButtonClick = () => {
    setIsDrawing(!isDrawing); // Toggle drawing mode
    setShowBrushSettings(!showBrushSettings); // Show brush settings menu
    setIsErasing(false); // Disable erasing when brush menu is active
  };

  // Handle Brush Size Change
  const handleBrushSizeChange = (event) => {
    setBrushSize(Number(event.target.value)); // Update brush size
  };

  // Handle Brush Color Change
  const handleBrushColorChange = (color) => {
    setBrushColor(color); // Update brush color
  };

  // Apply Zoom Incrementally
  const applyZoom = (deltaZoom) => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      const newZoomLevel = zoomLevel + deltaZoom;

      if (newZoomLevel < 0.1) return;

      setZoomLevel(newZoomLevel);
      canvas.setZoom(newZoomLevel);
      canvas.requestRenderAll();
    }
  };

  // Zoom In Functionality
  const zoomIn = () => {
    applyZoom(0.1); // Incrementally zoom in
  };

  // Zoom Out Functionality
  const zoomOut = () => {
    applyZoom(-0.1); // Incrementally zoom out
  };

  // Download the canvas content as a JPG
  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement("a");
      link.download = "canvas-image.jpg";
      link.href = canvas.toDataURL("image/jpeg", 1.0);
      link.click();
    }
  };

  return (
    <div
      className="h-screen w-screen flex bg-gray-100"
      style={{ marginTop: "30px" }}
    >
      <nav className="fixed top-0 left-0 w-full bg-white py-1 shadow-md z-50">
        <div className="container mx-auto flex justify-center items-center ">
          {/* Centered text with icon */}
          <h1
            className="text-sm font-medium flex items-center"
            style={{ color: "#702095" }}
          >
            Your therapist is watching
            <i
              className="fas fa-eye ml-2 text-xs"
              style={{ color: "#702095" }}
            ></i>
          </h1>
        </div>
      </nav>

      {/* Toolbar */}
      <div className="toolbar bg-white h-auto w-14 flex flex-col items-center py-2 shadow-lg space-y-3 fixed left-5 top-1/2 transform -translate-y-1/2">
        {/* cursor button */}
        <button
          onClick={() => setIsErasing(false)}
          className="hover:bg-purple-100 p-2 rounded-full"
        >
          <img
            src={cursorIcon}
            alt="Mouse Button"
            className="w-6 h-6 object-contain"
          />
        </button>
        {/* image button */}
        {/* Image Button */}
        <button
          ref={imageButtonRef} // Add ref to the button
          onClick={handleImageButtonClick}
          className="hover:bg-purple-100 p-2 rounded-full"
        >
          <img
            src={imageIcon}
            alt="Image Button"
            className="w-6 h-6 object-contain"
          />
        </button>

        {/* eraser button */}
        <button
          onClick={toggleEraseMode}
          className="hover:bg-purple-100 p-2 rounded-full"
        >
          <img
            src={eraserIcon}
            alt="Eraser Button"
            className="w-6 h-6 object-contain"
          />
        </button>
        {/* text button */}
        <button
          onClick={() => {
            addTextToCanvas();
            setIsErasing(false);
          }}
          className="hover:bg-purple-100 p-2 rounded-full"
        >
          <img
            src={textIcon}
            alt="Text Button"
            className="w-6 h-6 object-contain"
          />
        </button>
        {/* image cut button */}
        <button className="hover:bg-purple-100 p-2 rounded-full">
          <img
            src={scissorsIcon}
            alt="Scissor Button"
            className="w-6 h-6 object-contain"
          />
        </button>
        {/* brush button */}
        <button
          onClick={handleBrushButtonClick}
          className="hover:bg-purple-100 p-2 rounded-full"
        >
          <img
            src={brushIcon}
            alt="Brush Button"
            className="w-6 h-6 object-contain"
          />{" "}
        </button>
      </div>
      {/* Canvas */}
      <div className="flex-grow flex justify-center items-center p-4">
        <canvas
          ref={canvasRef}
          className="border border-gray-300 shadow-lg"
          width={600}
          height={700}
        ></canvas>
      </div>

      <div className="absolute top-5 right-5 flex items-center space-x-4">
        {/* Zoom In Button */}
        <button
          onClick={zoomIn}
          className="hover:bg-purple-100 p-2 rounded-full mt-8"
        >
          <i
            className="fas fa-search-plus text-lg"
            style={{ color: "#702095" }}
          ></i>
        </button>

        {/* Zoom Out Button */}
        <button
          onClick={zoomOut}
          className="hover:bg-purple-100 p-2 rounded-full mt-8"
        >
          <i
            className="fas fa-search-minus text-lg"
            style={{ color: "#702095" }}
          ></i>
        </button>

        {/* Download Button */}
        <button
          onClick={downloadCanvas}
          className="text-white font-semibold text-md py-2 px-5 rounded-lg ml-4 mt-8"
          style={{ backgroundColor: "#702095" }}
        >
          Download
        </button>
      </div>

      {/* Alert */}
      {showModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <i className="far fa-eye text-purple-600 text-lg"></i>
            <h2 className="text-lg font-bold mb-2">Shared Collage Access</h2>

            <p className="text-gray-700 mb-4 z-50">
              Your therapist can view your canvas.
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-800"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="image-modal absolute z-50 bg-white rounded-lg shadow-lg p-6"
          style={{ width: "400px", height: "400px", overflowY: "auto" }}
        >
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <input
              type="text"
              placeholder="Search Image"
              value={searchQuery}
              onChange={handleSearchChange}
              className="border border-gray-300 rounded w-full px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="text-white px-4 py-2 rounded w-full hover:bg-purple-600"
              style={{ backgroundColor: "#702095" }}
            >
              search
            </button>
          </form>

          <div className="grid grid-cols-2 gap-4">
            {searchResults.map((result) => {
              return (
                <div key={result.id} className="aspect-square">
                  <img
                    src={result.urls.raw}
                    alt={result.alt_description}
                    onClick={() => addImageToCanvas(result.urls.raw)}
                    className="w-full h-full object-cover rounded cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Brush Settings Menu */}
      {showBrushSettings && (
        <div className="absolute bottom-20 left-20 bg-white rounded-lg shadow-lg p-6 z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Brush</h3>
            <button onClick={() => setShowBrushSettings(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          {/* Brush Size Slider */}
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Size</label>
            <input
              type="range"
              min="1"
              max="100"
              value={brushSize}
              onChange={handleBrushSizeChange}
              className="w-full slider"
            />
            <div className="text-right mt-1 text-gray-500">{brushSize}px</div>
          </div>
          {/* Brush Color Options */}
          <div>
            <label className="block mb-2 text-gray-700">Color</label>
            <div className="grid grid-cols-6 gap-2">
              {[
                "black",
                "gray",
                "red",
                "orange",
                "yellow",
                "green",
                "blue",
                "purple",
                "pink",
                "brown",
              ].map((color) => (
                <button
                  key={color}
                  onClick={() => handleBrushColorChange(color)}
                  className={`w-8 h-8 rounded-full border ${
                    brushColor === color ? "ring-2 ring-purple-500" : ""
                  }`}
                  style={{ backgroundColor: color }}
                ></button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Session;
