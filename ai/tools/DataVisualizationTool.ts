import { FunctionDeclaration, Type } from "@google/genai";

type ChartType = "line" | "bar" | "area" | "pie" | "radar" | "scatter" | "composed";

function parseCsv(input: string): any[] {
  const lines = input.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const row: Record<string, any> = {};
    headers.forEach((h, i) => {
      const raw = (cols[i] ?? "").trim();
      const num = Number(raw);
      row[h] = isNaN(num) || raw === "" ? raw : num;
    });
    return row;
  });
}

function toArray(input: any): any[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof input === "string") {
    // try JSON first, fall back to CSV
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
    return parseCsv(input);
  }
  return [];
}

function formatNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1) + 'B';
  } else if (Math.abs(value) >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + 'M';
  } else if (Math.abs(value) >= 1_000) {
    return (value / 1_000).toFixed(1) + 'K';
  }
  return value.toString();
}

function aggregateData(data: any[], groupBy?: string, yKeys?: string[], agg: string = "sum"): any[] {
  if (!groupBy || !yKeys || yKeys.length === 0) return data;
  const groups = new Map<string, any[]>();
  for (const row of data) {
    const key = String(row[groupBy]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }
  const result: any[] = [];
  for (const [k, rows] of groups) {
    const out: any = { [groupBy]: k };
    for (const y of yKeys) {
      const values = rows.map((r) => Number(r[y])).filter((v) => !isNaN(v));
      let val: number = 0;
      if (values.length === 0) val = 0;
      else if (agg === "avg" || agg === "mean") val = values.reduce((a, b) => a + b, 0) / values.length;
      else if (agg === "min") val = Math.min(...values);
      else if (agg === "max") val = Math.max(...values);
      else if (agg === "count") val = values.length;
      else val = values.reduce((a, b) => a + b, 0);
      out[y] = Number(val.toFixed(4));
    }
    result.push(out);
  }
  return result;
}

export class DataVisualizationTool {
  getDefinition(): FunctionDeclaration {
    return {
      name: "data_visualization",
      description:
        "Transform raw data into beautiful, interactive charts and visualizations. Create professional-quality line charts, bar charts, pie charts, area charts, radar charts, scatter plots, and composed charts from JSON or CSV data. Perfect for data analysis, reporting, dashboard creation, and presenting insights. Automatically handles data aggregation, formatting, and responsive design. Returns a markdown code fence that renders to an interactive chart.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          data: { type: Type.STRING, description: "Raw data as JSON array of objects or CSV text. JSON format preferred for better control. Examples: '[{\"month\": \"Jan\", \"sales\": 100}, {\"month\": \"Feb\", \"sales\": 120}]' or CSV with headers. Supports automatic type detection for numbers and strings." },
          chartType: {
            type: Type.STRING,
            description: "Type of chart to create. 'line' for trends over time, 'bar' for comparisons, 'pie' for proportions, 'area' for cumulative data, 'radar' for multi-dimensional comparisons, 'scatter' for correlations, 'composed' for mixed chart types. Choose based on your data story.",
            enum: ["line", "bar", "area", "pie", "radar", "scatter", "composed"],
          },
          xKey: { type: Type.STRING, description: "Field name for the X axis or category. For line/bar charts: use time periods or categories. For pie charts: use category names. Examples: 'month', 'product', 'date', 'category'. If not specified, will use the first field in your data." },
          yKeys: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Numeric field names for Y axis values. For single series: ['sales']. For multiple series: ['sales', 'profit', 'expenses']. Each creates a separate line/bar in the chart. Must contain numeric data." },
          groupBy: { type: Type.STRING, description: "Field name to group and aggregate data by. Useful for summarizing data by categories. Example: group by 'region' to show total sales per region, or by 'month' to aggregate daily data into monthly totals." },
          aggregate: {
            type: Type.STRING,
            description: "Aggregation method when using groupBy. 'sum' adds values together (good for totals), 'avg' calculates mean (good for rates), 'count' counts occurrences, 'min'/'max' find extremes. Default: 'sum'.",
          },
          stacked: { type: Type.BOOLEAN, description: "For bar charts only: stack multiple series on top of each other instead of side-by-side. Good for showing total composition while maintaining individual series visibility. Default: false for grouped bars." },
          series: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT },
            description: "For composed charts only: define individual series with their types. Example: [{'type': 'bar', 'key': 'sales'}, {'type': 'line', 'key': 'trend'}] creates a bar+line combination chart. Supports 'bar', 'line', 'area' types."
          },
          colors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Custom colors for chart series. Provide hex codes or color names. Example: ['#FF6B6B', '#4ECDC4', '#96CEB4'] or ['red', 'teal', 'mint']. Default palette avoids strong blue tones and uses warm, accessible colors like coral, teal, mint green, yellow, and plum." },
          height: { type: Type.NUMBER, description: "Chart height in pixels (optional). Default height used if not specified. Range: 200-800px. Use larger heights for complex charts or when showing many data points. Example: 400 for standard charts, 600 for detailed visualizations." },
          title: { type: Type.STRING, description: "Chart title displayed below the visualization. Use to explain what the chart shows. Example: 'Monthly Sales Performance 2024' or 'Customer Satisfaction by Region'. Keep concise but descriptive." },
        },
        required: ["data", "chartType"],
      },
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const chartType = String(args.chartType || "line").toLowerCase() as ChartType;
      let rows = toArray(args.data);

      const xKey: string | undefined = args.xKey;
      const yKeys: string[] | undefined = args.yKeys;
      if (!xKey && (chartType !== "pie" && chartType !== "radar")) {
        // attempt to infer keys
        const sample = rows[0] || {};
        const keys = Object.keys(sample);
        if (keys.length >= 2) {
          args.xKey = keys[0];
          args.yKeys = [keys[1]];
        }
      }

      if (args.groupBy && args.yKeys) {
        rows = aggregateData(rows, args.groupBy, args.yKeys, args.aggregate);
        args.xKey = args.groupBy;
      }

      // Default color palette without blue tones
      const defaultColors = args.colors || [
        '#FF6B6B', // Coral red
        '#4ECDC4', // Teal
        '#45B7D1', // Light blue (keeping this as it's not a strong blue)
        '#96CEB4', // Mint green
        '#FFEAA7', // Yellow
        '#DDA0DD', // Plum
        '#98D8C8', // Seafoam
        '#F7DC6F', // Gold
        '#BB8FCE', // Lavender
        '#85C1E9'  // Light sky blue
      ];

      // Format large numbers in data
      const formattedRows = rows.map((row: any) => {
        const formattedRow = { ...row };
        if (args.yKeys) {
          args.yKeys.forEach((key: string) => {
            if (typeof formattedRow[key] === 'number' && Math.abs(formattedRow[key]) >= 1000) {
              formattedRow[key] = formatNumber(formattedRow[key]);
            }
          });
        }
        return formattedRow;
      });

      const spec: any = {
        type: chartType,
        title: args.title,
        data: formattedRows,
        xKey: args.xKey,
        yKeys: args.yKeys,
        stacked: Boolean(args.stacked),
        series: args.series,
        colors: defaultColors,
        height: args.height,
      };

      const lang = chartType === "line" ? "chart" : `chart-${chartType}`;
      const markdown = `\n\n\`\`\`${lang}\n${JSON.stringify(spec, null, 2)}\n\`\`\`\n\n`;

      return {
        success: true,
        message: "Chart spec generated",
        spec,
        markdown,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || String(error),
      };
    }
  }
}
