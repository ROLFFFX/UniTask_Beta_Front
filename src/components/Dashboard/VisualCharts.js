/**
 * @fileoverview This file includes the VisualCharts component, used for rendering
 * burndown charts representing the overall and personal progress of tasks in a
 * project management application. Note that the first processing of data is done
 * in this file, which later passed down to corresponding components respectively.
 */

import { Divider, Grid } from "@mui/material";
import React, { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import BurndownChart from "./BurndownChart";
import PersonalChart from "./PersonalChart";

/**
 * processTaskData - Processes a list of tasks into a data format suitable for the BurndownChart component. The processed data is for group task
 * progression overtime. Note that two dummy data is added, one is three days before creation with 0 points, the other one is three days after the
 * last task data with the points of last data. This is to prevent glitches at early stages of workspace.
 *
 * @param {Array} tasks - The list of tasks to process.
 * @param {string} currentDateStr - The current date as a string.
 * @param {string} creationDateStr - The creation date of the workspace as a string.
 * @returns {Array} An array of objects representing the processed task data.
 */
// process task data list to convert it into a data set that burndownchart.js accepts. key be timestamp, value be accumulated task points achieved.
function processTaskData(tasks, currentDateStr, creationDateStr) {
  const creationDate = new Date(creationDateStr);
  const currentDate = new Date(currentDateStr);

  // Add the first dummy data: 3 days before creation date
  const threeDaysBeforeCreation = new Date(
    creationDate.getTime() - 3 * 24 * 60 * 60 * 1000
  );
  const result = [{ key: threeDaysBeforeCreation.toISOString(), b: 0 }];

  // Filter tasks by status 'Done' and sort them by their expected completion time
  const filteredAndSortedTasks = tasks
    .filter((task) => task.status === "Done")
    .sort(
      (a, b) =>
        new Date(a.expectedCompleteTime) - new Date(b.expectedCompleteTime)
    );

  let totalTaskPoints = 0;
  filteredAndSortedTasks.forEach((task) => {
    totalTaskPoints += task.taskPoints;
    result.push({
      key: new Date(task.expectedCompleteTime).toISOString(),
      b: totalTaskPoints,
    });
  });

  // Add the second dummy data: 3 days after the last task's due date, if there are tasks
  if (filteredAndSortedTasks.length > 0) {
    const lastTaskDate = new Date(
      filteredAndSortedTasks[
        filteredAndSortedTasks.length - 1
      ].expectedCompleteTime
    );
    const threeDaysAfterLastTask = new Date(
      lastTaskDate.getTime() + 3 * 24 * 60 * 60 * 1000
    );
    result.push({
      key: threeDaysAfterLastTask.toISOString(),
      b: totalTaskPoints,
    });
  }

  return result;
}

/**
 * processPersonalTaskData - Processes a list of personal tasks into a data format suitable for the PersonalChart component. PersonalTaskData
 * will later be passed down to the personal task component. Note that two dummy data are added as well.
 *
 * @param {Array} tasks - The list of tasks to process.
 * @param {string} currentDateStr - The current date as a string.
 * @param {string} creationDateStr - The creation date of the workspace as a string.
 * @param {string} currentUserEmail - The email of the current user.
 * @returns {Array} An array of objects representing the processed personal task data.
 */
// this function processes personal task data. similar to processtaskdata, this function will only look at task corresponds to curent user
function processPersonalTaskData(
  tasks,
  currentDateStr,
  creationDateStr,
  currentUserEmail
) {
  const creationDate = new Date(creationDateStr);
  const currentDate = new Date(currentDateStr);
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
  const totalDays = Math.ceil((currentDate - creationDate) / oneDay);
  const intervalDays = 3;
  const numberOfIntervals = Math.ceil(totalDays / intervalDays);
  let intervals = [];

  for (let i = 0; i < numberOfIntervals; i++) {
    intervals.push({
      key: new Date(creationDate.getTime() + i * intervalDays * oneDay),
      personalPoints: 0,
    });
  }
  tasks.forEach((task) => {
    if (
      task.status === "Done" &&
      task.taskMemberAssigned.email === currentUserEmail
    ) {
      const taskCompleteTime = new Date(task.expectedCompleteTime);
      if (
        taskCompleteTime >= creationDate &&
        taskCompleteTime <= currentDate + 60 * 60 * 24
      ) {
        const intervalIndex = Math.floor(
          (taskCompleteTime - creationDate) / (intervalDays * oneDay)
        );
        // Add task points to all subsequent intervals for personal total
        for (let j = intervalIndex; j < intervals.length; j++) {
          intervals[j].personalPoints += task.taskPoints;
        }
      }
    }
  });
  // Adjust the last interval's key to be the current date
  // if (intervals.length > 0) {
  //   intervals[intervals.length - 1].key = currentDate;
  // }
  intervals[0].b = 0;
  return intervals;
}

function processPersonalTaskData_2(
  tasks,
  currentDateStr,
  creationDateStr,
  currentUserEmail
) {
  const creationDate = new Date(creationDateStr);
  const currentDate = new Date(currentDateStr);

  // Add the first dummy data: 3 days before creation date
  const threeDaysBeforeCreation = new Date(
    creationDate.getTime() - 3 * 24 * 60 * 60 * 1000
  );
  const result = [{ key: threeDaysBeforeCreation.toISOString(), b: 0 }];

  // Filter tasks by status 'Done' and user email, then sort by their expected completion time
  const filteredAndSortedTasks = tasks
    .filter(
      (task) =>
        task.status === "Done" &&
        task.taskMemberAssigned.email === currentUserEmail
    )
    .sort(
      (a, b) =>
        new Date(a.expectedCompleteTime) - new Date(b.expectedCompleteTime)
    );

  let totalTaskPoints = 0;
  filteredAndSortedTasks.forEach((task) => {
    totalTaskPoints += task.taskPoints;
    result.push({
      key: new Date(task.expectedCompleteTime).toISOString(),
      b: totalTaskPoints,
    });
  });

  // Add the second dummy data: 3 days after the last task's due date, if there are tasks
  if (filteredAndSortedTasks.length > 0) {
    const lastTaskDate = new Date(
      filteredAndSortedTasks[
        filteredAndSortedTasks.length - 1
      ].expectedCompleteTime
    );
    const threeDaysAfterLastTask = new Date(
      lastTaskDate.getTime() + 3 * 24 * 60 * 60 * 1000
    );
    result.push({
      key: threeDaysAfterLastTask.toISOString(),
      b: totalTaskPoints,
    });
  }

  return result;
}

/**
 * VisualCharts - A functional component for rendering burndown charts of task progress based on group / personal task contribution.
 *
 * This component displays two charts: one for overall task progress and another for personal task progress.
 * It uses the BurndownChart(./BurndownChart.js) and PersonalChart(./PersonalChart.js) components to render these charts.
 * The component processes task data and personal task data to format them appropriately for the charts.
 *
 * Props:
 * @param {Object} props - The props passed to the VisualCharts component.
 * @param {Array} props.taskData - The task data to be visualized.
 * @param {string} props.workspaceCreationTime - The creation time of the workspace.
 *
 * State:
 * @state @type {Array} processedData - The state for storing processed task data for the BurndownChart.
 * @state @type {Array} processedPersonalData - The state for storing processed personal task data for the PersonalChart.
 *
 * The component renders a grid layout containing the two charts. It conditionally renders the charts
 * only if the processed data is available.
 *
 * @returns {React.ReactElement} A React element representing the visual charts for task progress.
 */
export default function VisualCharts(props) {
  const { auth } = useAuth();
  const currentUserEmail = auth.user.userEmail;
  const [formattedTasks, setFormattedTasks] = useState();
  const [processedPersonalData, setProcessedPersonalData] = useState([]);

  // map over and format tasks. formattedTasks will contain all formatted main tasks
  useEffect(() => {
    // format data, slicing to leave only first item
    if (props.taskData && props.taskData.length > 0) {
      const firstItems = props.taskData.map((array) => array[0]);
      setFormattedTasks(firstItems);
    }
  }, [props]);
  const currentTime = new Date().toISOString();
  const creationTime = props.workspaceCreationTime;
  // At this point, we have:
  //    currentTime: current time in ISO String
  //    formattedTasks: list of main task JSON objects
  //    creationTime / props.workspaceCreationTime: contains workspace creation time in ISO String
  const [processedData, setProcessedData] = useState([]);

  useEffect(() => {
    if (formattedTasks && currentTime && creationTime) {
      // IMPORTANT: in block only runs when all variables are ready.
      const processingData = processTaskData(
        formattedTasks,
        currentTime,
        creationTime
      );
      setProcessedData(processingData);
      // process personal data
      const personalData = processPersonalTaskData_2(
        formattedTasks,
        currentTime,
        creationTime,
        currentUserEmail
      );
      setProcessedPersonalData(personalData);
    }
  }, [formattedTasks, creationTime, currentUserEmail]);

  return (
    <React.Fragment>
      {/* Conditional Rendering */}
      {processedData.length > 0 && processedPersonalData.length > 0 ? (
        <Grid
          container
          height="calc((100vh - 64px) * 0.9)"
          maxHeight="calc((100vh - 64px) * 0.9)"
          style={{
            overflow: "auto",
            justifyContent: "center",
            display: "flex",
          }}
          width="calc((100vw - 200px)*8/12)"
        >
          {/* Grid for Burndown Chart */}
          <Grid
            item
            xs={12}
            height="calc((100vh - 64px)* 0.9 /2)"
            maxHeight="calc((100vh - 64px)*0.9 /2)"
            overflow="hidden"
          >
            <BurndownChart processedData={processedData} />
          </Grid>
          {/* Grid for Personal Burndown Chart */}
          <Grid
            item
            xs={12}
            height="calc((100vh - 64px)*0.9 /2)"
            maxHeight="calc((100vh - 64px)*0.9 /2)"
            overflow="hidden"
          >
            <Divider />
            <PersonalChart processedPersonalData={processedPersonalData} />
          </Grid>
        </Grid>
      ) : (
        <div></div> // Render an empty div if condition is not met
      )}
    </React.Fragment>
  );
}
