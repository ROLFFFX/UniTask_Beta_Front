/**
 * @fileoverview This file includes the PersonalChart component, which is used for
 * rendering a personalized chart of task progression. It is rendered at the left
 * bottom in dashboard - data visual view.
 */

import AdsClickIcon from "@mui/icons-material/AdsClick";
import EmojiFoodBeverageIcon from "@mui/icons-material/EmojiFoodBeverage";
import { Box, Grid, Tooltip, Typography } from "@mui/material";
import Link from "@mui/material/Link";
import React, { useEffect, useState } from "react";
import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
} from "victory";

const cartesianInterpolations = [
  "basis",
  "bundle",
  "cardinal",
  "catmullRom",
  "linear",
  "monotoneX",
  "monotoneY",
  "natural",
  "step",
  "stepAfter",
  "stepBefore",
];

const polarInterpolations = ["basis", "cardinal", "catmullRom", "linear"];

/**
 * InterpolationSelect - Renders a selection of interpolation options.
 *
 * @param {Object} props - The props passed to the InterpolationSelect component.
 * @param {string} props.currentValue - The current selected interpolation value.
 * @param {Array<string>} props.values - Array of available interpolation options.
 * @param {Function} props.onChange - Callback function to handle interpolation change.
 * @returns {React.ReactElement} The component for selecting an interpolation option.
 */
const InterpolationSelect = ({ currentValue, values, onChange }) => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "14px",
      }}
    >
      {values.map((value) => (
        <Link
          key={value}
          component="button"
          color={currentValue === value ? "#495057" : "#212529"}
          onClick={() => onChange(value)}
          style={{
            cursor: "pointer",
            textDecoration: currentValue === value ? "underline" : "none", // underline selected item
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
            marginTop: "10px",
          }}
          href="#separators"
        >
          {value}
        </Link>
      ))}
    </div>
  );
};

/**
 * PersonalChart - A functional component for rendering a personal task progression chart.
 *
 * This component visualizes a user's task progression over time using a line chart. It allows
 * users to interactively select different interpolation methods for the chart. The component
 * also calculates and sets up the chart's size based on the window size and updates it on window resize.
 * Ideally, user will choose their interpolation according to preference. However, we all know nobody
 * is really going to use it. I personally only use linear and natural. It also provides 'polar' options,
 * which I don't even understand this mathmatical terms. The entire chart is provided by Victory.js
 *
 * Props:
 * @param {Array<Object>} processedPersonalData - The processed data used for the chart, containing
 *                                                 date (key) and value (b) pairs.
 *
 * State:
 * @state @type {number} personalTotal - The total value calculated from the data.
 * @state @type {Object} chartSize - The size of the chart, with width and height properties.
 * @state @type {string} interpolation - The current interpolation method for the chart.
 * @state @type {boolean} polar - Toggle for polar chart view.
 * @state @type {boolean} shouldRenderChart - Determines if the chart should be rendered based on the data.
 *
 * The component includes a header with the title and a chart rendered using the Victory library.
 * It conditionally renders the chart or a message if there is no data to display.
 *
 * @returns {React.ReactElement} A React element representing the personal task progression chart.
 */

// Sample processedData:
// processedData = [
//   {
//     key: "Fri Dec 01 2023 00:08:55 GMT-0500 (Eastern Standard Time)",
//     b: 100,
//   },
//   {
//     key: "Fri Nov 30 2023 00:08:55 GMT-0500 (Eastern Standard Time)",
//     b: 100,
//   },
// ];
const PersonalChart = ({ processedPersonalData }) => {
  const [personalTotal, setPersonalTotal] = useState(0);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });
  const [interpolation, setInterpolation] = useState("linear");
  const [polar, setPolar] = useState(false);
  const [shouldRenderChart, setshouldRenderChart] = useState(true);

  useEffect(() => {
    let uniqueBValues = new Set(processedPersonalData.map((data) => data.b));
    setshouldRenderChart(uniqueBValues.size > 1);
  }, [processedPersonalData]);

  const calculateSize = () => {
    const width = (window.innerWidth - 200) * (8 / 12);
    const height = (window.innerHeight - 64) * 0.45;
    setChartSize({ width, height });
  };

  const handleInterpolationChange = (value) => {
    setInterpolation(value);
  };

  useEffect(() => {
    {
      let total = 0;
      processedPersonalData.map((data) => {
        total += data.b;
      });
      setPersonalTotal(total);
    }
  }, [processedPersonalData]);

  useEffect(() => {
    calculateSize();
    window.addEventListener("resize", calculateSize);
    return () => window.removeEventListener("resize", calculateSize);
  }, []);

  const mapDataToChartFormat = (data) => {
    return data.map((item, index) => {
      const formattedDate = new Date(item.key).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return { x: formattedDate, y: item.b };
    });
  };

  const chartData = mapDataToChartFormat(processedPersonalData);
  // Get unique X-axis tick values
  const getUniqueTickValues = () => {
    return [...new Set(chartData.map((point) => point.x))];
  };

  return shouldRenderChart ? (
    <Box position="relative">
      <Grid container>
        {/* Grid for header */}
        <div
          style={{
            position: "absolute",
            left: "28%",
            top: "20%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: 1,
          }}
        >
          <Typography
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: "bold",
              color: "#212529",
            }}
            border={1}
            padding={1}
            borderRadius={2}
          >
            Personal Task Progression
          </Typography>
          <AdsClickIcon sx={{ marginLeft: "15px" }} />
        </div>
        <Tooltip
          title={
            <Typography
              style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
            >
              <strong>Personal Chart Guide:</strong>
              <br />
              <br />- <strong>Data Insights:</strong> This graph represents the
              progression of cumulative tasks achieved over time by you.
              <br />
              <br />- <strong>Interpolations:</strong> Choose the interpolation
              menu above to customize your view. We have 11 options to offer!
            </Typography>
          }
          arrow
          placement="top"
          TransitionProps={{ timeout: 600 }}
        >
          <div
            style={{
              position: "absolute",
              left: "28%",
              top: "15%",
              transform: "translate(-50%, -50%)",
              width: "300px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          ></div>
        </Tooltip>
        {/* Section for interpolation select */}
        <Grid item xs={12}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: 1,
              zIndex: 1000,
            }}
          >
            <InterpolationSelect
              currentValue={interpolation}
              values={polar ? polarInterpolations : cartesianInterpolations}
              onChange={setInterpolation}
            />
            {/* The commented part below allows to change to polar view, which i have no clue what it does */}
            {/* <input
                type="checkbox"
                id="polar"
                checked={polar}
                onChange={(event) => {
                  setPolar(event.target.checked);
                  setInterpolation("linear");
                }}
                style={{ marginLeft: 25, marginRight: 5 }}
              /> */}
            {/* <label htmlFor="polar">polar</label> */}
          </div>
        </Grid>
        {/* Grid for actual graph */}
        <Grid item xs={12}>
          <VictoryChart
            polar={polar}
            height={chartSize.height * 0.8}
            width={chartSize.width * 0.9}
          >
            {processedPersonalData.length > 1 && (
              <VictoryAxis
                tickValues={getUniqueTickValues()}
                style={{
                  axis: { stroke: "#756f6a" },
                  axisLabel: { fontSize: 12 },
                  ticks: { stroke: "grey", size: 5 },
                  tickLabels: { fontSize: 9 },
                }}
              />
            )}
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: "#756f6a" },
                axisLabel: { fontSize: 12 },
                ticks: { stroke: "grey", size: 5 },
                tickLabels: { fontSize: 9 },
              }}
            />

            <VictoryLine
              interpolation={interpolation}
              data={chartData}
              style={{ data: { stroke: "#c43a31" } }}
            />
            <VictoryScatter
              data={chartData}
              size={5}
              style={{ data: { fill: "#c43a31" } }}
            />
          </VictoryChart>
        </Grid>
      </Grid>
    </Box>
  ) : (
    <Box
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "calc((100vh - 64px) * 0.45)",
      }}
    >
      <EmojiFoodBeverageIcon color="action" />
      <Typography
        style={{ fontFamily: "Inter, sans-serif", marginLeft: "10px" }}
      >
        You haven't done any tasks yet...
      </Typography>
    </Box>
  );
};

export default PersonalChart;
