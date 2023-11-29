import Diversity2Icon from "@mui/icons-material/Diversity2";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import GroupRemoveIcon from "@mui/icons-material/GroupRemove";
import {
  Box,
  Divider,
  IconButton,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FixedSizeList } from "react-window";
import useAuth from "../../hooks/useAuth";
import { ENDPOINT_URL } from "../../hooks/useConfig";
import InviteNewMemberModal from "./InviteNewMemberModal";

//render individual member in react window
function renderMemberItem(props, teamMembers, handleRemoveUser) {
  const { index, style } = props;
  const member = teamMembers[index];
  return (
    <Box
      key={member.userEmail}
      style={{
        ...style,
        // border: "1px solid black", //to add border for each inidividual member rendered
        // borderRadius: 5,
        // marginTop: "5px",
        boxSizing: "border-box", // to ensure total width includes padding and borders.
        width: "100%",
      }}
    >
      <ListItem
        key={member.userEmail}
        disableGutters
        secondaryAction={
          <IconButton
            aria-label="remove"
            onClick={() => handleRemoveUser(member.userEmail)}
            sx={{ padding: 3 }}
          >
            <GroupRemoveIcon />
          </IconButton>
        }
      >
        <ListItemText
          primary={`${member.userName}`}
          secondary={member.userEmail}
          secondaryTypographyProps={{ style: { color: "#6C757D" } }}
          sx={{
            marginLeft: 5,
            "& .MuiListItemText-primary": {
              fontFamily: "Inter, sans-serif",
            },
          }}
        />
      </ListItem>
    </Box>
  );
}

export default function ManageTeamContent() {
  const [openModal, setOpenModal] = useState(false);
  const [backdropOpen, setBackdropOpen] = useState(false); //loading page
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const { auth } = useAuth();
  const projectTitle = auth.selectedWorkspace;
  const [teamMembers, setTeamMembers] = useState([]);
  const refreshTeamMembers = () => {
    //refetch team member, specifically used after success invitation
    fetchTeamMembers(); // Re-fetch team members
  };

  const handleRemoveUser = async (userEmail) => {
    setBackdropOpen(true); //display loading page
    try {
      const response = await axios.delete(
        `${ENDPOINT_URL}projects/deleteUserFromWorkspace/${userEmail}/${projectTitle}`,
        {
          headers: {
            Authorization: `Bearer ${auth.user.userJWT}`,
          },
        }
      );
      if (response.status === 204) {
        console.log("User removed successfully.");
        refreshTeamMembers();
      }
    } catch (error) {
      console.error("Error removing user from project: ", error);
    } finally {
      setBackdropOpen(false);
    }
  };

  const fetchTeamMembers = async () => {
    setBackdropOpen(true); //display loading page
    try {
      const response = await axios.get(
        `${ENDPOINT_URL}projects/workspaceMembers/${projectTitle}`,
        {
          headers: {
            Authorization: `Bearer ${auth.user.userJWT}`,
          },
        }
      );
      // Parse the response data and update the team member state
      const parsedTeamMembers = response.data.map((user) => ({
        userName: user.username,
        userEmail: user.email,
      }));
      setTeamMembers(parsedTeamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setBackdropOpen(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  return (
    <React.Fragment>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backdropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          //   alignItems: "center",
          maxWidth: "lg", // Or another desired value, or remove maxWidth
          padding: "40px",
          backgroundColor: "white",
          borderRadius: "16px", // Adjust this value for more or less rounded corners
          boxShadow: "0 3px 5px rgba(0, 0, 0, 0.3)", // Adjust values and color for desired shadow effect
        }}
      >
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Diversity2Icon style={{ marginRight: 8 }} />
          <Typography
            sx={{
              color: "#343A40",
              fontSize: 20,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Manage Team Members:{" "}
            <span style={{ fontWeight: "bold" }}>{auth.selectedWorkspace}</span>
          </Typography>
        </Box>
        <Divider sx={{ width: "100%", padding: 1 }} />
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          padding={3}
        >
          <Button onClick={handleOpenModal} variant="outlined" color="inherit">
            <GroupAddIcon style={{ marginRight: 8 }} />
            Invite New Team Member
          </Button>
          <InviteNewMemberModal
            open={openModal}
            handleClose={handleCloseModal}
            onInviteSuccess={refreshTeamMembers}
          />
        </Box>

        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          padding={3}
        >
          <Typography
            sx={{
              color: "#343A40",
              fontSize: 14,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {teamMembers.length} Current Members
          </Typography>
        </Box>
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FixedSizeList
            height={380}
            width="100%"
            itemSize={65}
            itemCount={teamMembers.length}
            overscanCount={5}
          >
            {(props) => renderMemberItem(props, teamMembers, handleRemoveUser)}
          </FixedSizeList>
        </Box>
      </Box>
    </React.Fragment>
  );
}
