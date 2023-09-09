import React, { useContext, useEffect, useRef, useState } from "react";
import Brush from "@spectrum-icons/workflow/Brush";
import Gradient from "@spectrum-icons/workflow/Gradient";
import {
  ButtonGroup,
  Item,
  TagGroup,
  Text,
  Button,
  ToggleButton,
} from "@adobe/react-spectrum";
import { ColorContext } from "@/context/ColorContext";

function Canvas() {
  const [selectedTool, setSelectedTool] = useState("brush");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { colorPalette, selectedPaletteColorIndex } = useContext(ColorContext);
  const isPressing = useRef<boolean>(false);
  useEffect(() => {
    if (colorPalette.length === 0) return;
    const dpr = window.devicePixelRatio || 1;
    const mouseMoveHandler = (e: MouseEvent) => {
      if (canvasRef.current && isPressing.current) {
        const ctx = canvasRef.current.getContext("2d");
        const scaleX = canvasRef.current.width / canvasRef.current.offsetWidth;
        const scaleY =
          canvasRef.current.height / canvasRef.current.offsetHeight;
        if (ctx) {
          ctx.beginPath();
          ctx.arc(e.offsetX * scaleX, e.offsetY * scaleY, 5, 0, 2 * Math.PI);
          const { r, g, b } = colorPalette[selectedPaletteColorIndex];
          ctx.fillStyle = `rgba(${r},${g},${b},0.5)`;
          ctx.fill();
        }
      }
    };
    const mouseDownHandler = (e: MouseEvent) => {
      if (canvasRef.current) {
        isPressing.current = true;
        const ctx = canvasRef.current.getContext("2d");
        const scaleX = canvasRef.current.width / canvasRef.current.offsetWidth;
        const scaleY =
          canvasRef.current.height / canvasRef.current.offsetHeight;
        if (ctx) {
          ctx.beginPath();
          ctx.arc(e.offsetX * scaleX, e.offsetY * scaleY, 5, 0, 2 * Math.PI);
          const { r, g, b } = colorPalette[selectedPaletteColorIndex];
          ctx.fillStyle = `rgba(${r},${g},${b},0.5)`;
          ctx.fill();
        }
      }
    };
    const mouseUpHandler = (e: MouseEvent) => {
      if (canvasRef.current) {
        isPressing.current = false;
      }
    };
    const mouseLeaveHandler = (e: MouseEvent) => {
      if (canvasRef.current) {
        isPressing.current = false;
      }
    };
    if (canvasRef.current) {
      canvasRef.current.addEventListener("mousemove", mouseMoveHandler);
      canvasRef.current.addEventListener("mousedown", mouseDownHandler);
      canvasRef.current.addEventListener("mouseup", mouseUpHandler);
      canvasRef.current.addEventListener("mouseleave", mouseLeaveHandler);
    }
    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener("mousemove", mouseMoveHandler);
        canvasRef.current.removeEventListener("mousedown", mouseDownHandler);
        canvasRef.current.removeEventListener("mouseup", mouseUpHandler);
        canvasRef.current.removeEventListener("mouseleave", mouseLeaveHandler);
      }
    };
  }, [canvasRef, colorPalette, selectedPaletteColorIndex]);

  return (
    <div className="max-w-[400px] w-[400px] flex flex-col mt-10">
      <ButtonGroup
        aria-label="TagGroup with icons example"
        flexShrink={0}
        UNSAFE_className="py-2 gap-2"
      >
        <ToggleButton
          UNSAFE_style={{
            paddingLeft: 5,
            paddingRight: 5,
            cursor: "pointer",
          }}
          UNSAFE_className="cursor-pointer"
          isSelected={selectedTool === "brush"}
          onPress={() => {
            setSelectedTool("brush");
          }}
        >
          <Brush size="S" UNSAFE_className="mr-1" />
          <Text
            UNSAFE_style={{
              fontSize: 12,
              padding: 0,
            }}
          >
            Brush
          </Text>
        </ToggleButton>
        <ToggleButton
          UNSAFE_className="cursor-pointer"
          UNSAFE_style={{
            paddingLeft: 5,
            paddingRight: 5,
            cursor: "pointer",
          }}
          isSelected={selectedTool === "gradient"}
          onPress={() => {
            setSelectedTool("gradient");
          }}
        >
          <Gradient size="S" UNSAFE_className="mr-1" />
          <Text
            UNSAFE_style={{
              fontSize: 12,
              padding: 0,
            }}
          >
            Gradient
          </Text>
        </ToggleButton>
      </ButtonGroup>
      <canvas
        ref={canvasRef}
        className="flex-1 w-full border border-2 border-gray-300 "
      />
    </div>
  );
}

export default Canvas;
