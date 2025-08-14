import React from "react";
import mermaid from "mermaid";

import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";

mermaid.initialize({
  startOnLoad: true,
  theme: "dark",
  securityLevel: "loose",
  maxTextSize: 90000,
  flowchart: {
    subGraphTitleMargin: {
      top: 0,
      bottom: 20,
    },
    nodeSpacing: 50,
    rankSpacing: 50,
    padding: 10,
    diagramPadding: 10,
  },
  themeCSS: `
    g.classGroup rect {
      fill: #282a36;
      stroke: #6272a4;
    }
    g.classGroup text {
      fill: #f8f8f2;
    }
    g.classGroup line {
      stroke: #f8f8f2;
      stroke-width: 0.5;
    }
    .classLabel .box {
      stroke: #21222c;
      stroke-width: 3;
      fill: #21222c;
      opacity: 1;
    }
    .classLabel .label {
      fill: #f1fa8c;
    }
    .relation {
      stroke: #ff79c6;
      stroke-width: 1;
    }
    #compositionStart, #compositionEnd {
      fill: #bd93f9;
      stroke: #bd93f9;
      stroke-width: 1;
    }
    #aggregationEnd, #aggregationStart {
      fill: #21222c;
      stroke: #50fa7b;
      stroke-width: 1;
    }
    #dependencyStart, #dependencyEnd {
      fill: #00bcd4;
      stroke: #00bcd4;
      stroke-width: 1;
    }
    #extensionStart, #extensionEnd {
      fill: #f8f8f2;
      stroke: #f8f8f2;
      stroke-width: 1;
    }`,
  fontFamily: "Fira Code",
});

export default class Mermaid extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mermaidCode: props.chart || "",
    };

    // Initialize zoom and pan state as instance properties
    this.isPanning = false;
    this.startX = 0;
    this.startY = 0;
    this.currentScale = 1;
    this.currentTranslateX = 0;
    this.currentTranslateY = 0;
  }

  renderMermaidDiagram = () => {
    const element = document.getElementById("mermaid");
    if (!element) return;

    element.removeAttribute("data-processed");
    element.innerHTML = this.state.mermaidCode;

    try {
      mermaid.contentLoaded();
      this.addZoomAndPan();
    } catch (err) {
      console.error(err);
    }
  };

  componentDidMount() {
    this.renderMermaidDiagram();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.chart !== this.props.chart) {
      this.setState({ mermaidCode: this.props.chart || "" });
    }

    if (prevState.mermaidCode !== this.state.mermaidCode) {
      clearTimeout(this.renderTimeout);

      this.renderTimeout = setTimeout(() => {
        this.renderMermaidDiagram();
      }, 500);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.renderTimeout);
  }

  addZoomAndPan = () => {
    setTimeout(() => {
      const svg = document.querySelector("#mermaid svg");
      if (svg && !svg.dataset.zoomEnabled) {
        this.enableZoomAndPan(svg);
        svg.dataset.zoomEnabled = "true";

        // Additional SVG fixes
        svg.setAttribute("preserveAspectRatio", "xMinYMin meet");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.style.maxWidth = "75vw";
      }
    }, 100);
  };

  enableZoomAndPan = (svg) => {
    svg.style.cursor = "grab";

    let isPanning = false;
    let lastX = 0;
    let lastY = 0;
    let rafId = null;

    const g = svg.querySelector("g");

    const applyTransform = () => {
      if (!g) return;
      g.style.transform = `translate(${this.currentTranslateX}px, ${this.currentTranslateY}px) scale(${this.currentScale})`;
      g.style.transformOrigin = "0 0";
      rafId = null;
    };

    const scheduleTransform = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(applyTransform);
      }
    };

    // Wheel Zoom
    svg.addEventListener("wheel", (e) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(
        0.1,
        Math.min(5, this.currentScale * scaleFactor),
      );

      const dx = x - this.currentTranslateX;
      const dy = y - this.currentTranslateY;

      this.currentTranslateX = x - dx * (newScale / this.currentScale);
      this.currentTranslateY = y - dy * (newScale / this.currentScale);
      this.currentScale = newScale;

      scheduleTransform();
    });

    // Pan
    svg.addEventListener("pointerdown", (e) => {
      isPanning = true;
      lastX = e.clientX;
      lastY = e.clientY;
      svg.setPointerCapture(e.pointerId);
      svg.style.cursor = "grabbing";
    });

    svg.addEventListener("pointermove", (e) => {
      if (!isPanning) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      this.currentTranslateX += dx;
      this.currentTranslateY += dy;
      this.renderTimeout = null;
      scheduleTransform();
    });

    svg.addEventListener("pointerup", () => {
      isPanning = false;
      svg.style.cursor = "grab";
    });

    svg.addEventListener("pointerleave", () => {
      isPanning = false;
      svg.style.cursor = "grab";
    });

    // Reset on double-click
    svg.addEventListener("dblclick", () => {
      this.currentScale = 1;
      this.currentTranslateX = 0;
      this.currentTranslateY = 0;
      scheduleTransform();
    });
  };

  updateTransform = (svg) => {
    const g = svg.querySelector("g");
    if (g) {
      g.style.transform = `translate(${this.currentTranslateX}px, ${this.currentTranslateY}px) scale(${this.currentScale})`;
      g.style.transformOrigin = "0 0";
    }
  };

  render() {
    try {
      return (
        <div style={{ display: "flex", height: "80vh", width: "100%" }}>
          {/* Diagram Container */}
          <div
            className="mermaid"
            id="mermaid"
            style={{
              flex: 1,
              height: "100%",
              border: "1px solid #ccc",
              position: "relative",
            }}
          />

          {this.props.showEditor && (
            <div
              className="bg-gray-900 border-l border-gray-700 flex flex-col"
              style={{
                width: "25vw",
                height: "100%",
                overflow: "hidden",
              }}
            >
              {/* Editor Header */}
              <div className="bg-gray-800 p-4 border-b border-gray-700">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  Mermaid Editor
                </h2>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-auto">
                  <CodeMirror
                    value={this.state.mermaidCode}
                    extensions={[markdown()]}
                    theme="dark"
                    onChange={(val) => {
                      this.setState({ mermaidCode: val });
                    }}
                    basicSetup={{
                      lineNumbers: true,
                      highlightActiveLine: true,
                      autocompletion: true,
                    }}
                    style={{
                      height: "100%",
                      fontFamily: "Fira Code, Monaco, Consolas, monospace",
                      backgroundColor: "#1a1a1a",
                    }}
                  />
                </div>

                {/* Editor Footer */}
                <div className="bg-gray-800 px-4 py-2 border-t border-gray-700">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      Lines: {this.state.mermaidCode.split("\n").length}
                    </span>
                    <span>Mermaid Syntax</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    } catch (error) {
      if (error.name === "UnknownDiagramError") {
        return (
          <div className="error">Unknown Diagram Error: {error.message}</div>
        );
      }
      return <div className="error">Syntax Error: {error.message}</div>;
    }
  }
}
