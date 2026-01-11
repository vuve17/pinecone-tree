"use client";

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Box, Stack } from '@mui/material';
import { Node } from '@prisma/client';
import React, { useMemo } from 'react';
import { TreeNode } from './tree-node';

interface RecursiveTreeProps {
  currentNode: Node;
  allNodes: Node[];
  onEdit: (id: number, title: string) => void;
  onDelete: (node: Node) => void;
  onAddChild: (parentId: number, title: string) => void;
  onMoveOrder: (nodeId: number, direction: -1 | 1) => void;
  isRoot?: boolean;
}

export const RecursiveTree: React.FC<RecursiveTreeProps> = ({
  currentNode,
  allNodes,
  onEdit,
  onDelete,
  onAddChild,
  onMoveOrder,
  isRoot = true,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: currentNode.id,
    data: { ...currentNode }
  });

  const children = useMemo(() => {
    return allNodes
      .filter(n => n.parentNodeId === currentNode.id)
      .sort((a, b) => a.ordering - b.ordering);
  }, [allNodes, currentNode.id]);

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1000 : 1,
    position: 'relative' as const,
    opacity: isDragging ? 0.9 : 1,
    pointerEvents: (isDragging ? 'none' : 'auto') as any,
  };

  const hasChildren = children.length > 0;

  const NodeAndChildren = (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: isDragging ? 'none' : 'transform 200ms ease'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <TreeNode
          node={currentNode}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
          onMoveOrder={onMoveOrder}
          dragHandleProps={{ ...attributes, ...listeners }}
          isDraggingInternally={isDragging}
        />
        {hasChildren && (
          <Box sx={{ width: '1px', height: 32, bgcolor: 'grey.300' }} />
        )}
      </Box>

      {hasChildren && (
        <Box sx={{ position: 'relative', width: '100%' }}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: children.length > 1 ? 'calc(100% - 192px)' : '0px',
              height: '1px',
              bgcolor: 'grey.300'
            }}
          />

          <Stack
            direction="row"
            justifyContent="center"
            spacing={4}
            sx={{ mt: 0 }}
          >
            {children.map((child) => (
              <Box key={child.id} sx={{ position: 'relative', pt: 4 }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '1px',
                    height: 32,
                    bgcolor: 'grey.300'
                  }}
                />
                <RecursiveTree
                  currentNode={child}
                  allNodes={allNodes}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddChild={onAddChild}
                  onMoveOrder={onMoveOrder}
                  isRoot={false}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );

  if (isRoot) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, minWidth: 'max-content' }}>
        {NodeAndChildren}
      </Box>
    );
  }

  return NodeAndChildren;
};