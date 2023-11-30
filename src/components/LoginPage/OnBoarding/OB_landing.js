import { Box, Divider, ThemeProvider } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { BottomSVG } from "../LoginStyling/BottomSVG";
import { TopSVG } from "../LoginStyling/TopSVG";
import theme from "../LoginStyling/theme";
import ChooseName from "./Steps/ChooseName";
import ChooseRole from "./Steps/ChooseRole";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";
import { ENDPOINT_URL } from "../../../hooks/useConfig";

export function OB_landing() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [workspaceName, setWorkspaceName] = React.useState(""); // new state for storing the workspace name
  const [role, setRole] = React.useState("");
  const navigate = useNavigate();
  const { auth } = useAuth();
  const token = auth.user.userJWT;

  const steps = ["Choose Name", "Choose Role"];

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <ChooseName
            workspaceName={workspaceName}
            setWorkspaceName={setWorkspaceName}
          />
        );
      case 1:
        return <ChooseRole role={role} setRole={setRole} />;
      default:
        throw new Error("Unknown step");
    }
  }

  const handleNext = async () => {
    if (activeStep === 0) {
      // axios.post workspace name
      try {
        // validate workspace name
        if (
          workspaceName &&
          workspaceName.trim().length > 0 &&
          workspaceName[workspaceName.length - 1] !== " "
        ) {
          const response = await axios.post(
            `${ENDPOINT_URL}projects/createNewWorkspace`,
            {
              projectTitle: workspaceName,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
        } else {
          alert("Invalid Input. ");
        }
        // console.log(response.data);
      } catch (error) {
        alert("Error: This Workspace Name is Already Taken!");
        console.error("There was an error!", error);
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleToRoot = () => {
    navigate("/login/login_with_group");
  };

  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
        <TopSVG style={{ position: "absolute", zindex: "-1" }} />
        <CssBaseline />
        <AppBar
          position="absolute"
          color="default"
          elevation={0}
          sx={{
            position: "relative",
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
          }}
        ></AppBar>
        <Container
          component="main"
          maxWidth="sm"
          sx={{ mt: 2, mb: 4 }}
          style={{ position: "relative", zIndex: 1 }}
        >
          <Box
            sx={{
              marginTop: 15,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              maxWidth: "lg",
              padding: "40px",
              backgroundColor: "#F8F9FA",
              borderRadius: "16px",
              boxShadow: "0 3px 5px rgba(0, 0, 0, 0.3)",
            }}
          >
            <Typography
              component="h1"
              variant="h4"
              align="center"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Welcome to UniTask
            </Typography>

            <Typography
              component="h1"
              variant="subtitle1"
              align="center"
              marginTop={3}
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Let's create your first workspace now! Workspace is the shared
              environment of your team where you can edit & view the status of
              the project with your teammates.
            </Typography>
            <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        "&.MuiStepIcon-root": {
                          color: "#495057",
                        },
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            <Divider
              sx={{
                // my: 1,
                height: "5px",

                width: "100%",
              }}
            ></Divider>
            <React.Fragment>
              {activeStep === steps.length ? (
                <React.Fragment>
                  <Typography
                    variant="h5"
                    gutterBottom
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Onboarding Process is complete!
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Congratulations! You just created your workspace. Let's go
                    to your workspace now!
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleToRoot}
                    sx={{ mt: 3, ml: 1 }}
                  >
                    Go To My Workspace
                  </Button>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {getStepContent(activeStep)}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      width: "100%",
                      mt: 3,
                    }}
                  >
                    {activeStep !== 0 && (
                      <Button
                        variant="contained"
                        onClick={handleBack}
                        sx={{ mt: 3, ml: 1 }}
                      >
                        Back
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 3, ml: 1 }}
                    >
                      {activeStep === steps.length - 1 ? "Complete" : "Next"}
                    </Button>
                  </Box>
                </React.Fragment>
              )}
            </React.Fragment>
          </Box>
        </Container>
        <Box>
          <BottomSVG
            sx={{ margin: 0, padding: 0 }}
            style={{ position: "absolute", zindex: "-1" }}
          />
        </Box>
      </ThemeProvider>
    </React.Fragment>
  );
}
