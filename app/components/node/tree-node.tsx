"use client";

import { useDroppable } from '@dnd-kit/core';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  IconButton,
  InputBase,
  Paper,
  Tooltip,
  Typography
} from '@mui/material';
import { Node } from '@prisma/client';
import React, { useCallback, useMemo, useState } from 'react';

interface TreeNodeProps {
  node: Node;
  onEdit: (id: number, newTitle: string) => void;
  onDelete: (node: Node) => void;
  onAddChild: (parentId: number, title: string) => void;
  // -1 = left, 1 = right
  onMoveOrder: (nodeId: number, direction: -1 | 1) => void;
  dragHandleProps?: any;
  isDraggingInternally?: boolean;
}

export const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  onEdit,
  onDelete,
  onAddChild,
  onMoveOrder,
  dragHandleProps,
  isDraggingInternally
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(node.title);

  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: node.id,
    data: node,
  });

  const handleRename = useCallback(() => {
    const trimmed = tempTitle.trim();
    if (trimmed && trimmed !== node.title) {
      onEdit(node.id, trimmed);
    } else {
      setTempTitle(node.title);
    }
    setIsEditing(false);
  }, [tempTitle, node.id, node.title, onEdit]);

  const inputMemoContent = useMemo(() => {
    if (!isEditing) return (
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 'bold',
          color: 'text.secondary',
          userSelect: 'none',
          textAlign: 'center',
        }}
      >
        {node.title}
      </Typography>
    );

    return (
      <InputBase
        autoFocus
        onPointerDown={(e) => e.stopPropagation()}
        value={tempTitle}
        onChange={(e) => setTempTitle(e.target.value)}
        onBlur={handleRename}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleRename();
          else if (e.key === 'Escape') {
            setTempTitle(node.title);
            setIsEditing(false);
          }
        }}
        sx={{
          width: '100%',
          input: { textAlign: 'center', fontWeight: 'bold' },
          borderBottom: '1px solid',
          borderColor: 'primary.main',
        }}
      />
    );
  }, [isEditing, tempTitle, node.title, handleRename]);

  return (
    <Box
      ref={setDroppableNodeRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="node-element"
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        outline: isOver ? '3px solid #4ade80' : 'none',
        outlineOffset: '2px',
        borderRadius: '8px',
        transition: 'outline 0.2s ease',
      }}
    >
      {isHovered && !isEditing && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            display: 'flex',
            gap: 1,
            zIndex: 15,
            width: "192px",
            justifyContent: node.id === 1 ? "center" : "space-between",
          }}
        >
          {
            node.id !== 1 && (
              <Tooltip title="Move Left">
                <IconButton
                  size="small"
                  onClick={() => onMoveOrder(node.id, -1)}
                  sx={{ bgcolor: 'white', border: '1px solid #ccc', '&:hover': { bgcolor: '#f0f0f0' } }}
                >
                  <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )
          }
          <Tooltip title="Add Child Node">
            <IconButton
              size="small"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onAddChild(node.id, `New Node`); }}
              sx={{
                p: 0,
                m: 0,
                bgcolor: 'transparent',
                maxWidth: '40.32px',
                maxHeight: '40.32px',
                border: 0,
                color: 'success.main',
                zIndex: 10,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <AddCircleIcon />
            </IconButton>
          </Tooltip>
          {
            node.id !== 1 && (
              <Tooltip title="Move Right">
                <IconButton
                  size="small"
                  onClick={() => onMoveOrder(node.id, 1)}
                  sx={{ bgcolor: 'white', border: '1px solid #ccc', '&:hover': { bgcolor: '#f0f0f0' } }}
                >
                  <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
        </Box>
      )}

      <Paper
        {...dragHandleProps}
        elevation={isHovered ? 4 : 1}
        sx={{
          position: 'relative',
          width: 192,
          height: 80,
          backgroundColor: 'white',
          border: '2px solid',
          borderColor: isHovered ? 'primary.main' : 'grey.200',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          transition: 'all 0.2s',
          cursor: isDraggingInternally ? 'grabbing' : isHovered ? 'grab' : 'default',
        }}
      >
        {isHovered && !isEditing && node.id !== 1 && (
          <Box
            sx={{
              position: 'absolute',
              top: -12,
              right: 8,
              display: 'flex',
              gap: 0.5,
              bgcolor: 'background.paper',
              border: '1px solid #ccc',
              borderRadius: 1,
              p: 0.5,
              zIndex: 20,
              boxShadow: 1,
            }}
          >
            <IconButton
              size="small"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              sx={{ p: 0.5, '&:hover': { color: 'primary.main' } }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onDelete(node); }}
              sx={{ p: 0.5, '&:hover': { color: 'error.main' } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {inputMemoContent}
      </Paper>
    </Box>
  );
};