import React from 'react';

/**
 * The small curve that a widget shows next to its value.
 *
 * It is the line, the area under it and - when there is room for it - a few labels on the left and a grid. No
 * axis, no tooltip, nothing to click: for that the widget opens its dialog with the full chart
 * ([[HistoryChart]]). This replaced the charting library the widget set used to carry for these few pixels.
 */

export interface SparklineSeries {
    data: { ts: number; val: number }[];
    /** The line; the area under it is drawn in the same color, much paler. */
    color: string;
    /** A boolean is held until the next value arrives. */
    isBoolean?: boolean;
}

export interface SparklineProps {
    series: SparklineSeries[];
    width: number;
    height: number;
    /** Labels on the left and a grid - only worth it when the curve has some room. */
    withGrid?: boolean;
    /** Written behind the labels. */
    unit?: string;
    /** The system writes a comma instead of a point. */
    isFloatComma?: boolean;
    style?: React.CSSProperties;
}

/** How much room the labels need when the curve has a grid. */
const GRID_LEFT = 34;

/**
 * The curve.
 *
 * @param props the series and the room they may take
 * @returns the SVG, or null when there is nothing to draw
 */
export default function Sparkline(props: SparklineProps): React.JSX.Element | null {
    const { series, width, height, withGrid, unit, isFloatComma, style } = props;

    if (!width || !height || !series.some(s => s.data.length > 1)) {
        return null;
    }

    let tsMin = Infinity;
    let tsMax = -Infinity;
    let valMin = Infinity;
    let valMax = -Infinity;
    for (const s of series) {
        for (const p of s.data) {
            if (p.ts < tsMin) {
                tsMin = p.ts;
            }
            if (p.ts > tsMax) {
                tsMax = p.ts;
            }
            if (p.val < valMin) {
                valMin = p.val;
            }
            if (p.val > valMax) {
                valMax = p.val;
            }
        }
    }
    if (tsMax === tsMin) {
        tsMax = tsMin + 1;
    }
    if (valMax === valMin) {
        // a flat line belongs in the middle
        valMin -= 0.5;
        valMax += 0.5;
    }
    const air = (valMax - valMin) * 0.08;
    valMin -= air;
    valMax += air;

    const left = withGrid ? GRID_LEFT : 0;
    const bottom = 1;
    const plotW = width - left - 1;
    const plotH = height - bottom - 1;
    const tsToX = (ts: number): number => left + ((ts - tsMin) / (tsMax - tsMin)) * plotW;
    const valToY = (val: number): number => 1 + plotH - ((val - valMin) / (valMax - valMin)) * plotH;

    /**
     * A value as it is written next to the curve.
     *
     * @param value the value
     * @returns the value as text, with the unit behind it
     */
    const label = (value: number): string => {
        const abs = Math.abs(value);
        const text = abs >= 100 ? value.toFixed(0) : abs >= 10 ? value.toFixed(1) : value.toFixed(2);
        return `${isFloatComma ? text.replace('.', ',') : text}${unit || ''}`;
    };

    return (
        <svg
            width={width}
            height={height}
            style={style}
        >
            {withGrid
                ? [valMin + air, (valMin + valMax) / 2, valMax - air].map((value, i) => (
                      <React.Fragment key={i}>
                          <line
                              x1={left}
                              x2={width}
                              y1={valToY(value)}
                              y2={valToY(value)}
                              stroke="currentColor"
                              opacity={0.1}
                          />
                          {i !== 1 ? (
                              <text
                                  x={left - 3}
                                  y={valToY(value) + (i ? 8 : 0)}
                                  textAnchor="end"
                                  fontSize={9}
                                  fill="currentColor"
                                  opacity={0.5}
                              >
                                  {label(value)}
                              </text>
                          ) : null}
                      </React.Fragment>
                  ))
                : null}
            {series.map((s, i) => {
                if (s.data.length < 2) {
                    return null;
                }
                const points = s.data.map(p => ({ x: tsToX(p.ts), y: valToY(p.val) }));
                let d = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
                for (let j = 1; j < points.length; j++) {
                    d += s.isBoolean
                        ? `H${points[j].x.toFixed(1)}V${points[j].y.toFixed(1)}`
                        : `L${points[j].x.toFixed(1)},${points[j].y.toFixed(1)}`;
                }
                const baseY = (1 + plotH).toFixed(1);
                return (
                    <React.Fragment key={i}>
                        <path
                            d={`${d}L${points[points.length - 1].x.toFixed(1)},${baseY}L${points[0].x.toFixed(1)},${baseY}Z`}
                            fill={s.color}
                            opacity={0.14}
                        />
                        <path
                            d={d}
                            fill="none"
                            stroke={s.color}
                            strokeWidth={1.5}
                            strokeLinejoin="round"
                            opacity={0.65}
                        />
                    </React.Fragment>
                );
            })}
        </svg>
    );
}
