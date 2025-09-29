import React, { useState, MouseEvent } from "react";
import { type FC } from "react";
import { Retool } from "@tryretool/custom-component-support";

// Types
interface BarDataPoint {
  label: string;
  value: number;
  color?: string;
  category?: string;
  metadata?: Record<string, string | number | boolean>;
}

// Tooltip component
const Tooltip: FC<{
  show: boolean;
  x: number;
  y: number;
  content: string;
}> = ({ show, x, y, content }) => {
  if (!show || !content) return null;

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 50,
        backgroundColor: "rgba(6,74,85,0.9)",
        color: "white",
        fontSize: "12px",
        padding: "6px 10px",
        borderRadius: "6px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        pointerEvents: "none",
        left: x,
        top: y,
        transform: "translateX(-50%)",
        whiteSpace: "nowrap",
      }}
    >
      {content}
    </div>
  );
};

// Bar component
const Bar: FC<{
  data: BarDataPoint;
  maxValue: number;
  orientation: "vertical" | "horizontal";
  showValues: boolean;
  onBarClick?: (dataPoint: BarDataPoint) => void;
  index: number;
}> = ({ data, maxValue, orientation, showValues, onBarClick }) => {
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    content: string;
  }>({
    show: false,
    x: 0,
    y: 0,
    content: "",
  });

  const percentage = maxValue > 0 ? (data.value / maxValue) * 100 : 0;
  const isVertical = orientation === "vertical";
  const barColor = data.color || "#064A55";

  const handleMouseEnter = (e: MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();

    setTooltip({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8, // luôn hiển thị ngay bên dưới bar
      content: `${data.label}: ${data.value.toLocaleString?.() || 0}`,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, content: "" });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isVertical ? "column" : "row",
        alignItems: "center",
        gap: isVertical ? "6px" : "12px",
        position: "relative",
        width: isVertical ? "auto" : "100%",
      }}
    >
      {/* Label khi vertical */}
      {isVertical && (
        <div
          style={{
            marginBottom: "8px",
            fontSize: "13px",
            color: "#374151",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          {data.label}
        </div>
      )}

      {/* Label khi horizontal */}
      {!isVertical && (
        <div
          style={{
            fontSize: "13px",
            color: "#374151",
            display: "flex",
            alignItems: "center",
            width: "100px",
            flexShrink: 0,
            fontWeight: 500,
          }}
        >
          {data.label}
        </div>
      )}

      {/* Bar container */}
      <div
        style={{
          position: "relative",
          cursor: onBarClick ? "pointer" : "default",
          width: isVertical ? "48px" : "100%",
          height: isVertical ? "250px" : "170%",
          backgroundColor: "#f3f4f6",
          borderRadius: "4px",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: isVertical ? "flex-end" : "center",
        }}
      >
        {/* Bar fill */}
        <div
          style={{
            backgroundColor: barColor,
            borderRadius: "4px",
            transition: "all 0.3s ease-in-out",
            [isVertical ? "height" : "width"]: `${percentage}%`,
            [isVertical ? "width" : "height"]: "100%",
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => onBarClick?.(data)}
        />

        {/* Value label */}
        {showValues && (
          <div
            style={{
              position: "absolute",
              fontSize: "11px",
              fontWeight: 600,
              color: "black",
              right: isVertical ? "auto" : "8px",
              top: isVertical ? "6px" : "50%",
              left: isVertical ? "50%" : "auto",
              transform: isVertical
                ? "translateX(-50%)"
                : "translateY(-50%)",
            }}
          >
            {data.value?.toLocaleString?.() || 0}
          </div>
        )}
      </div>

      {/* Tooltip */}
      <Tooltip {...tooltip} />
    </div>
  );
};

// Main BarChart component
export const BarChartCustom: FC = () => {
  const [title] = Retool.useStateString({ name: "title" });
  const [subtitle] = Retool.useStateString({ name: "subtitle" });
  const [data] = Retool.useStateArray({ name: "data" });
  const [orientation] = Retool.useStateEnumeration({
    name: "orientation",
    enumDefinition: ["vertical", "horizontal"],
  });
  const [showValues = true] = Retool.useStateBoolean({
    name: "showValues",
    initialValue: true,
  });
  const [maxBars] = Retool.useStateNumber({ name: "maxBars" });
  const [isDrillDownEnabled = false] = Retool.useStateBoolean({
    name: "isDrillDownEnabled",
    initialValue: false,
  });

  const displayData: BarDataPoint[] = (data || [])
    .slice(0, maxBars || 10)
    .map((d: any) => ({
      label: d.label,
      value: d.value,
      color: d.color,
    }));
  const maxValue = Math.max(...displayData.map((d) => d.value || 0), 1);

  const handleBarClick = (dataPoint: BarDataPoint) => {
    if (!isDrillDownEnabled) return;
    Retool.triggerEvent?.("onBarClick", dataPoint);
  };

  return (
    <div
      style={{
        width: "93%",
        height: "400px",
        backgroundColor: "white",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        padding: "20px",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#111827",
            margin: 0,
          }}
        >
          {title || "Bar Chart"}
        </h3>
        {subtitle && (
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
            {subtitle}
          </p>
        )}
        <div style={{ marginTop: "12px", borderBottom: "1px solid #e5e7eb" }} />
      </div>

      {/* Chart Content */}
      <div
        style={{
          height: "320px",
          display: "flex",
          flexDirection: orientation === "vertical" ? "row" : "column",
          alignItems: orientation === "vertical" ? "end" : "stretch",
          justifyContent: "space-between",
          gap: orientation === "vertical" ? "24px" : "12px",
        }}
      >
        {displayData.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
            }}
          >
            No data available
          </div>
        ) : (
          displayData.map((dataPoint, index) => (
            <Bar
              key={index}
              data={dataPoint}
              maxValue={maxValue}
              orientation={orientation as "vertical" | "horizontal"}
              showValues={showValues}
              onBarClick={isDrillDownEnabled ? handleBarClick : undefined}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
};
