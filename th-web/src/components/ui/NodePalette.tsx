import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { FaStar, FaRegStar, FaEllipsisV } from "react-icons/fa"; // Added import for "More" icon
import { NodeTypeDefinition } from "../../types";
import { getIconForNodeType } from "./IconMap";

const NodePaletteContainer = styled.div`
  margin-bottom: 20px;
`;

const NodeCategory = styled.div`
  margin-bottom: 16px;
`;

const CategoryTitle = styled.h3`
  font-size: 16px;
  margin-bottom: 8px;
  color: #495057;
  cursor: pointer;
`;

const NodeItem = styled.div`
  padding: 8px 12px;
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;

  &:hover {
    background-color: #e9ecef;
  }
`;

const NodeIcon = styled.span`
  margin-right: 8px;
  color: #6c757d;
`;

const FavoriteIcon = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  cursor: pointer;
  color: ${(props: { isFavorite: boolean }) =>
    props.isFavorite ? "#ffc107" : "#6c757d"};

  &:hover {
    color: #ffc107;
  }
`;

const SearchContainer = styled.div`
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 6px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
`;

const FavoriteFilter = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: ${(props) => (props.active ? "#ffc107" : "#6c757d")};

  &:hover {
    color: #ffc107;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 24px;
  right: 0;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: ${(props: { isOpen: boolean }) => (props.isOpen ? "block" : "none")};
`;

const DropdownItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: #e9ecef;
  }
`;

interface NodePaletteProps {
  nodeTypes: NodeTypeDefinition[];
  setNodeTypes: React.Dispatch<React.SetStateAction<NodeTypeDefinition[]>>;
  handleRightClickFavoriteNode: (
    event: React.MouseEvent,
    nodeType: NodeTypeDefinition
  ) => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({
  nodeTypes,
  setNodeTypes,
  handleRightClickFavoriteNode,
}) => {

  const [collapsedCategories, setCollapsedCategories] = useState<{
    [key: string]: boolean;
  }>({
    source: false,
    action: false,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  const filteredNodeTypes = nodeTypes.filter((type) => {
    const matchesSearch = type.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFavorite = !showOnlyFavorites || type.isFavorite;
    return matchesSearch && matchesFavorite;
  });
  const toggleCategory = useCallback((category: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);
  
    const toggleFavoriteNodeType = useCallback(
      (nodeType: NodeTypeDefinition) => {
        setNodeTypes((prevNodeTypes) =>
          prevNodeTypes.map((type) =>
            type.type === nodeType.type
              ? { ...type, isFavorite: !type.isFavorite }
              : type
          )
        );
      },
      [setNodeTypes]
    );

  const renderCategory = useCallback(
    (category: string, title: string) => {
      const categoryNodes = filteredNodeTypes.filter(
        (type) => type.category === category
      );

      return (
        <NodeCategory>
          <CategoryTitle onClick={() => toggleCategory(category)}>
            {title} ({categoryNodes.length}){" "}
            {collapsedCategories[category] ? "▼" : "▲"}
          </CategoryTitle>
          {!collapsedCategories[category] &&
            categoryNodes.map((nodeType) => (
              <NodeItem
                key={nodeType.type}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(
                    "application/reactflow",
                    nodeType.type
                  );
                  event.dataTransfer.effectAllowed = "move";
                }}
                onContextMenu={(event) =>
                  handleRightClickFavoriteNode(event, nodeType)
                }
              >
                <NodeIcon>{getIconForNodeType(nodeType.type)}</NodeIcon>
                {nodeType.name}
                <FavoriteIcon
                  isFavorite={nodeType.isFavorite}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleFavoriteNodeType(nodeType);
                  }}
                >
                  {nodeType.isFavorite ? <FaStar /> : <FaRegStar />}
                </FavoriteIcon>
              </NodeItem>
            ))}
        </NodeCategory>
      );
    },
    [
      filteredNodeTypes,
      collapsedCategories,
      toggleCategory,
      toggleFavoriteNodeType,
      handleRightClickFavoriteNode,
    ]
  );

  return (
    <NodePaletteContainer>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div style={{ position: "relative" }}>
          <FaEllipsisV onClick={toggleDropdown} style={{ cursor: "pointer" }} />
          <DropdownMenu isOpen={dropdownOpen}>
            <DropdownItem
              onClick={() => {
                setShowOnlyFavorites((prev) => !prev);
                closeDropdown();
              }}
            >
              {showOnlyFavorites ? <FaStar /> : <FaRegStar />}
              Only favorite
            </DropdownItem>
          </DropdownMenu>
        </div>
      </SearchContainer>
      {renderCategory("source", "Data Sources")}
      {renderCategory("sink", "Sinks")}
      {renderCategory("action", "Actions")}
    </NodePaletteContainer>
  );
};

export default NodePalette;
