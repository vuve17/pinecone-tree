"use client";

import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import EditIcon from '@mui/icons-material/Edit';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MouseIcon from '@mui/icons-material/Mouse';
import PanToolIcon from '@mui/icons-material/PanTool';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography
} from '@mui/material';
import { useState } from 'react';

export const HelpInstructionsTooltip = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="Help & Instructions" placement="left">
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            top: 32,
            right: 32,
            zIndex: 1100,
            boxShadow: 6,
            width: 56,
            height: 56
          }}
          onClick={() => setOpen(true)}
        >
          <HelpOutlineIcon fontSize="large" />
        </Fab>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 4, p: 2 }
          }
        }}
      >
        <DialogTitle sx={{
          fontSize: '1.75rem',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <InfoOutlinedIcon fontSize="large" color="primary" /> Tree Workspace Instructions
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              What is this Workspace?
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }} color="text.secondary">
              This is a <strong>General Tree</strong> editor. Unlike a binary tree, each node can have
              an <strong>unlimited number of children</strong>. You can build complex hierarchies by
              simply attaching nodes to one another.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Controls & Features:
          </Typography>

          <List sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
            <ListItem alignItems="flex-start" disableGutters>
              <ListItemIcon sx={{ minWidth: 50 }}>
                <PanToolIcon fontSize="large" color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={<Typography variant="h6" fontWeight="bold">Drag & Drop (Re-parenting)</Typography>}
                secondary={
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                    Drag any node and <strong>drop it directly onto another node</strong> to attach it as a child.
                    The entire subtree moves with it!
                  </Typography>
                }
              />
            </ListItem>

            <ListItem alignItems="flex-start" disableGutters>
              <ListItemIcon sx={{ minWidth: 50 }}>
                <SwapHorizIcon fontSize="large" color="secondary" />
              </ListItemIcon>
              <ListItemText
                primary={<Typography variant="h6" fontWeight="bold">Horizontal Reordering</Typography>}
                secondary={
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                    Hover over a node to reveal <strong>Left/Right arrows</strong>.
                    Use these to change the sequence of siblings under the same parent.
                  </Typography>
                }
              />
            </ListItem>

            <ListItem alignItems="flex-start" disableGutters>
              <ListItemIcon sx={{ minWidth: 50 }}>
                <EditIcon fontSize="large" color="action" />
              </ListItemIcon>
              <ListItemText
                primary={<Typography variant="h6" fontWeight="bold">Inline Editing</Typography>}
                secondary={
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                    Click the edit icon on a hovered node to rename it.
                    Press <strong>&apos;Enter&apos;</strong> to save or <strong>&apos;Esc&apos;</strong> to cancel.
                  </Typography>
                }
              />
            </ListItem>

            <ListItem alignItems="flex-start" disableGutters>
              <ListItemIcon sx={{ minWidth: 50 }}>
                <DeleteSweepIcon fontSize="large" color="error" />
              </ListItemIcon>
              <ListItemText
                primary={<Typography variant="h6" fontWeight="bold">Node Deletion</Typography>}
                secondary={
                  <Typography variant="body1" color="error.main" sx={{ mt: 0.5, fontWeight: 500 }}>
                    Careful! Deleting a node will <strong>permanently remove all of its children</strong>.
                  </Typography>
                }
              />
            </ListItem>

            <ListItem alignItems="flex-start" disableGutters>
              <ListItemIcon sx={{ minWidth: 50 }}>
                <MouseIcon fontSize="large" color="action" />
              </ListItemIcon>
              <ListItemText
                primary={<Typography variant="h6" fontWeight="bold">Navigation</Typography>}
                secondary={
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                    Use the <strong>scroll wheel</strong> to zoom.
                    <strong> Click and hold</strong> the background to pan across the workspace.
                  </Typography>
                }
              />
            </ListItem>
          </List>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpen(false)}
            variant="contained"
            size="large"
            disableElevation
            sx={{ borderRadius: 2, px: 6, py: 1.5, fontSize: '1.1rem' }}
          >
            Got it!
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};