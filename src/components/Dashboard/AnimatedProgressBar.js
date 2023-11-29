import React, { useState, useEffect } from "react";
import { VictoryPie, VictoryAnimation, VictoryLabel } from "victory";
import { Box, Grid, Typography, Tooltip } from "@mui/material";

export default function AnimatedProgressBar({ progressData }) {
  // Destructuring props
  const [percent, setPercent] = useState(0);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (progressData && progressData.progressBarData) {
      const doneRatio = calculateDoneRatio(progressData);
      setPercent(doneRatio * 100); // Assuming you want to display it as a percentage
    }
  }, [progressData]); // Depend on progressData

  const calculateDoneRatio = (progressData) => {
    const progressBarData = progressData.progressBarData;
    const total = Object.values(progressBarData).reduce(
      (sum, value) => sum + value,
      0
    );
    const doneValue = progressBarData.Done || 0;
    setDone(doneValue);
    setTotal(total);

    return total === 0 ? 0 : doneValue / total;
  };

  const data = getData(percent);

  function getData(percent) {
    return [
      { x: 1, y: percent },
      { x: 2, y: 100 - percent },
    ];
  }

  return (
    <Grid container>
      <Grid item xs={12}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          marginTop="-10px"
        >
          <Tooltip
            title={
              <Typography
                style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}
              >
                {`Tasks worth of ${done} task points are done out of ${total} taskpoints.`}
              </Typography>
            }
            arrow
            placement="top"
            TransitionProps={{ timeout: 600 }}
          >
            <svg viewBox="0 0 400 400" width="60%">
              <VictoryPie
                standalone={false}
                animate={{ duration: 1000 }}
                width={400}
                height={400}
                data={data}
                innerRadius={120}
                cornerRadius={25}
                labels={() => null}
                style={{
                  data: {
                    fill: ({ datum }) => {
                      let color;
                      if (percent <= 20) {
                        color = "#99e2b4";
                      } else if (percent <= 40) {
                        color = "#78c6a3";
                      } else if (percent <= 60) {
                        color = "#56ab91";
                      } else if (percent <= 80) {
                        color = "#469d89";
                      } else {
                        color = "#248277";
                      }
                      return datum.x === 1 ? color : "transparent";
                    },
                  },
                }}
              />
              <VictoryAnimation duration={1000} data={{ percent }}>
                {(newProps) => (
                  <VictoryLabel
                    textAnchor="middle"
                    verticalAnchor="middle"
                    x={200}
                    y={200}
                    text={`${Math.round(newProps.percent)}%`}
                    style={{ fontSize: 45 }}
                  />
                )}
              </VictoryAnimation>
            </svg>
          </Tooltip>
        </Box>
      </Grid>
    </Grid>
  );
}
