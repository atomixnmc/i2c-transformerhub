import React from "react";
import styled from "styled-components";
import { NodeTypeDefinition } from "../../types";
import { getIconForNodeType } from "./IconMap";

const ContextMenuContainer = styled.div`
  position: absolute;
  z-index: 10;
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MenuItem = styled.div`
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #e9ecef;
  }
`;

const NodeIcon = styled.span`
  margin-right: 8px;
  color: #6c757d;
`;

interface CanvasContextMenuProps {
  position: { x: number; y: number } | null;
  onClose: () => void;
  onAddFavoriteNode: (nodeType: NodeTypeDefinition) => void;
  favoriteNodeTypes: NodeTypeDefinition[];
}

const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  position,
  onClose,
  onAddFavoriteNode,
  favoriteNodeTypes,
}) => {
  if (!position) return null;

  return (
    <ContextMenuContainer
      style={{ top: position.y, left: position.x }}
      onMouseLeave={onClose}
    >
      {favoriteNodeTypes.map((nodeType) => (
        <MenuItem
          key={nodeType.type}
          onClick={() => {
            onAddFavoriteNode(nodeType);
            onClose();
          }}
        >
          <NodeIcon>{getIconForNodeType(nodeType.type)}</NodeIcon>
          {nodeType.name}
        </MenuItem>
      ))}
    </ContextMenuContainer>
  );
};

export default CanvasContextMenu;
