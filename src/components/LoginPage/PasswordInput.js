/**
 * @fileoverview This file includes the PasswordInput component, which is a
 * custom password input field used in user registration and login processes.
 * It provides additional password check and interactively prompt the user
 * to design their passwords.
 */

import Key from "@mui/icons-material/Key";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import FormHelperText from "@mui/material/FormHelperText";
import * as React from "react";
import theme from "./LoginStyling/theme";
import { ThemeProvider } from "@mui/material/styles";

/**
 * PasswordInput - A functional component for rendering a password input field with validation.
 *
 * This component provides an input textfield for password entry along with real-time validation feedback.
 * It includes a progress bar to indicate the strength of the password based on its length and displays
 * helper text to guide the user to meet the password criteria. The criteria include having a minimum length of 8,
 * containing at least one numeral, and at least one uppercase letter.
 *
 * Props:
 * @prop {Function} onInputChange - Function to handle the change in the password input field.
 * @prop {Function} onCriteriaMetChange - Function to notify when the password meets the specified criteria.
 *
 * State:
 * @state @type {string} value - The current value of the password input field.
 * @state @type {boolean} focused - Boolean to indicate if the password input field is focused.
 * @state @type {boolean} hasNumber - Boolean indicating if the password contains at least one number.
 * @state @type {boolean} hasUppercase - Boolean indicating if the password contains at least one uppercase letter.
 * @state @type {boolean} isLengthValid - Boolean indicating if the password length is within the specified range.
 * @state @type {boolean} criteriaMet - Boolean indicating if the password meets all the specified criteria.
 *
 * @returns {React.ReactElement} A React element representing a custom password input field with validation feedback.
 */
export function PasswordInput({ onInputChange, onCriteriaMetChange }) {
  const minLength = 8;
  const maxLength = 16;
  const [value, setValue] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const handleFocus = () => {
    setFocused(true);
  };
  const handleBlur = () => {
    setFocused(false);
  };
  const hasNumber = /\d/.test(value);
  const hasUppercase = /[A-Z]/.test(value);
  const isLengthValid = value.length >= minLength && value.length <= maxLength;

  const handleInputChange = (event) => {
    setValue(event.target.value);
    onInputChange(event); // pass the event to the provided onInputChange handler
  };

  const criteriaMet = hasNumber && hasUppercase && isLengthValid;
  React.useEffect(() => {
    // Notify SignUp component about criteria met status change
    onCriteriaMetChange(criteriaMet);
  }, [criteriaMet, onCriteriaMetChange]);

  return (
    <ThemeProvider theme={theme}>
      <Stack spacing={0.5}>
        <TextField
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="new-password"
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          InputLabelProps={{ style: { fontSize: 14 } }}
          InputProps={{
            startAdornment: focused ? <Key /> : null,
          }}
          error={!criteriaMet && focused}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: !criteriaMet && focused ? "red" : "", // Set borderColor to red when criteria is not met and field is focused
              },
              "&:hover fieldset": {
                borderColor: !criteriaMet && focused ? "red" : "", // Maintain red borderColor on hover when criteria is not met and field is focused
              },
              "&.Mui-focused fieldset": {
                borderColor: !criteriaMet && focused ? "red" : "", // Maintain red borderColor when field is focused and criteria is not met
              },
            },
          }}
        />

        {focused && (
          <>
            <LinearProgress
              variant="determinate"
              size="sm"
              value={Math.min((value.length * 100) / maxLength, 100)}
              sx={{
                backgroundColor: "#DEE2E6", // setting the background color of the container to yellow
                "& .MuiLinearProgress-determinate": {
                  backgroundColor: "#DEE2E6", // ensuring the determinate variant also has a yellow background
                },
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#212529", // setting the color of the progress bar to black
                },
              }}
            />
            <FormHelperText
              sx={{
                color: criteriaMet ? "success.main" : "error.main",
              }}
            >
              {!hasNumber && "Include at least one numeral."}
              <br />
              {!isLengthValid && "Be 8 to 16 characters in length. "}
              <br />
              {!hasUppercase && "Contain at least one uppercase letter."}
            </FormHelperText>
            <Typography
              variant="body2"
              sx={{
                alignSelf: "flex-end",
                color: criteriaMet ? "success.main" : "error.main",
              }}
            >
              {criteriaMet ? "Criteria Met" : "Criteria Not Met"}
            </Typography>
          </>
        )}
      </Stack>
    </ThemeProvider>
  );
}
