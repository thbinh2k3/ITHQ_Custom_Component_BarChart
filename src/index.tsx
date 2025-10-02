import React, { useState, MouseEvent } from "react";
import { type FC } from "react";
import { Retool } from "@tryretool/custom-component-support";
import "./app.css";

// Types
interface BarDataPoint {
  label: string;
  value: number;
  color?: string;
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
      y: rect.bottom + 8,
      content: `${data.label}: ${data.value.toLocaleString?.() || 0}`,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, content: "" });
  };



  if (isVertical) {
    // ---------------- Vertical bar ----------------
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          position: "relative",
        }}
      >
        {/* Label */}
        <div
          style={{
            marginBottom: "4px",
            fontSize: "13px",
            color: "#374151",
            textAlign: "center",
            fontWeight: 500,
            wordBreak: "break-word",
          }}
        >
          {data.label}
        </div>

        {/* Bar container */}
        <div
          style={{
            position: "relative",
            cursor: onBarClick ? "pointer" : "default",
            width: "48px",
            height: "250px",
            backgroundColor: "#f3f4f6",
            borderRadius: "4px",
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          {/* Bar fill */}
          <div
            style={{
              backgroundColor: barColor,
              borderRadius: "4px",
              transition: "all 0.3s ease-in-out",
              height: `${percentage}%`,
              width: "100%",
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
                color: percentage >= 95 ? "white" : "black",
                top: '6px',
                left: "50%",
                transform: "translateX(-50%)"
              }}
            >
              {data.value?.toLocaleString?.() || 0}
            </div>
          )}
        </div>

        <Tooltip {...tooltip} />
      </div>
    );
  }

  // ---------------- Horizontal bar ----------------
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        position: "relative",
      }}
    >
      {/* Label (có thể xuống dòng, không ảnh hưởng bar) */}
      <div
        style={{
          fontSize: "13px",
          color: "#374151",
          width: "120px",          // cố định vùng label
          flexShrink: 0,
          fontWeight: 500,
          textAlign: "right",
          wordBreak: "break-word", // cho phép xuống dòng
          whiteSpace: "normal",
          lineHeight: "1.2em",
        }}
      >
        {data.label}
      </div>

      {/* Bar container */}
      <div
        style={{
          position: "relative",
          cursor: onBarClick ? "pointer" : "default",
          flex: 1,
          height: "24px",           // ✅ luôn cố định
          backgroundColor: "#f3f4f6",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Bar fill */}
        <div
          style={{
            backgroundColor: barColor,
            borderRadius: "4px",
            transition: "all 0.3s ease-in-out",
            width: `${percentage}%`,
            height: "100%",         // ✅ không bị ảnh hưởng label
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
              color: percentage >= 95 ? "white" : "black",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            {data.value?.toLocaleString?.() || 0}
          </div>
        )}
      </div>

      <Tooltip {...tooltip} />
    </div>
  );
};


/// Main BarChart component
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

  const [point, setPoint] = Retool.useStateObject({
    name: 'point',
    initialValue: {},
    inspector: 'hidden'
  })

  // 🔑 Lưu bar được click
  // const [clickedBar, setClickedBar] = Retool.useStateObject({
  //   name: "clickedBar",
  // });

  const displayData: BarDataPoint[] = (data || []).map((d: any) => ({
    label: d.label,
    value: d.value,
    color: d.color || "#064A55",
  }));

  const maxValue = Math.max(...displayData.map((d) => d.value || 0), 1);

  const triggerClickBar = Retool.useEventCallback({ name: "onBarClick" });

  const handleBarClick = (dataPoint: BarDataPoint) => {
    setPoint(dataPoint as unknown as Record<string, any>);
    triggerClickBar();
  };

  return (
    <div
      style={{
        width: "93%",
        height: "auto",
        backgroundColor: "white",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        padding: "20px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          {/* Icon trước title */}
          <img
            src="https://img.icons8.com/?size=100&id=MubK8Jc9u2hm&format=png&color=064A55"
            alt="chart-icon"
            style={{ width: "20px", height: "20px" }}

          />
          <h3
            style={{
              fontFamily: "'Lexend Deca', sans-serif",
              fontSize: "18px",
              fontWeight: 600,
              color: "#111827",
              margin: 0,
            }}
          >
            {title || "Bar Chart"}
          </h3>
        </div>

        {subtitle && (
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              margin: 0,
              fontFamily: "Imb Plex Sans, sans-serif",
            }}
          >
            {subtitle}
          </p>
        )}
        <div style={{ marginTop: "8px", borderBottom: "1px solid #e5e7eb" }} />
      </div>

      {/* Chart Content */}
      <div
        style={{
          fontFamily: "'Lexend Deca', sans-serif",
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
              index={index}
              onBarClick={() => handleBarClick(dataPoint)}
            />
          ))
        )}
      </div>

      {/* <button
        onClick={() => {
          setClickedBar({ label: "Manual trigger", value: 123 });
          triggerClickBar();
        }}
      >
        Send message
      </button> */}
    </div>
  );
};
