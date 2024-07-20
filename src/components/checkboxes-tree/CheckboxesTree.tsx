import { useState, useEffect, useRef } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TreeNode {
  id: number;
  name: string;
  parent_id?: number;
  children?: TreeNode[];
}

export interface AppProps {
  data: TreeNode[];
  name: string;
}

// BFS algorithm to find node by its ID
const bfsSearch = (graph: TreeNode[], targetId: number): TreeNode | null => {
  const queue = [...graph];
  while (queue.length > 0) {
    const currNode = queue.shift();
    if (currNode) {
      if (currNode.id === targetId) {
        return currNode;
      }
      if (currNode.children) {
        queue.push(...currNode.children);
      }
    }
  }
  return null;
};

const CategoriesTree: React.FC<AppProps> = ({ data, name }) => {
  const [selectedNodes, setSelectedNodes] = useState<number[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  //   const [, meta, helpers] = useField({ name });
  //   const { value } = meta;
  //   const { setValue } = helpers;

  //   useEffect(() => {
  //     setSelectedNodes(value);
  //   }, [value]);

  //   useEffect(() => {
  //     setValue(selectedNodes);
  //   }, [selectedNodes, setValue]);

  const getAllIds = (node: TreeNode, idList: number[] = []): number[] => {
    idList.push(node.id);
    if (node.children) {
      node.children.forEach((child) => getAllIds(child, idList));
    }
    return idList;
  };

  const getAllChild = (id: number): number[] => {
    const node = bfsSearch(data, id);
    if (node) {
      return getAllIds(node);
    }
    return [];
  };

  const getAllFathers = (id: number, list: number[] = []): number[] => {
    const node = bfsSearch(data, id);
    if (node && node.parent_id) {
      const parentId = Number(node.parent_id);
      list.push(parentId);
      return getAllFathers(parentId, list);
    }
    return list;
  };

  const isAllChildrenChecked = (node: TreeNode, list: number[]): boolean => {
    const allChild = getAllChild(node.id);
    const nodeIdIndex = allChild.indexOf(node.id);
    allChild.splice(nodeIdIndex, 1);

    return allChild.every((nodeId) =>
      selectedNodes.concat(list).includes(nodeId)
    );
  };

  const handleNodeSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    nodeId: number
  ): void => {
    event.stopPropagation();
    const allChild = getAllChild(nodeId);
    const fathers = getAllFathers(nodeId);

    if (selectedNodes.includes(nodeId)) {
      setSelectedNodes((prevSelectedNodes) =>
        prevSelectedNodes.filter((id) => !allChild.concat(fathers).includes(id))
      );
    } else {
      const ToBeChecked = allChild;
      for (let i = 0; i < fathers.length; ++i) {
        const node = bfsSearch(data, fathers[i]);
        if (node && isAllChildrenChecked(node, ToBeChecked)) {
          ToBeChecked.push(fathers[i]);
        }
      }
      setSelectedNodes((prevSelectedNodes) =>
        [...prevSelectedNodes].concat(ToBeChecked)
      );
    }
  };

  const handleNodeToggle = (nodeId: number) => {
    setExpandedNodes((prevExpandedNodes) => {
      const newExpandedNodes = new Set(prevExpandedNodes);
      if (newExpandedNodes.has(nodeId)) {
        newExpandedNodes.delete(nodeId);
      } else {
        newExpandedNodes.add(nodeId);
      }
      return newExpandedNodes;
    });
  };

  const renderTree = (nodes: TreeNode, depth = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(nodes.id);
    return (
      <div key={nodes.id} style={{ paddingLeft: depth * 30 }}>
        <div className="flex items-center gap-x-3">
          {nodes.children && (
            <button
              type="button"
              aria-expanded={isExpanded}
              title="expand/collapse the node children"
              onClick={() => handleNodeToggle(nodes.id)}
            >
              <ChevronRight
                className={cn("transition-transform duration-300 ease-in-out", {
                  "rotate-90": isExpanded,
                })}
              />
            </button>
          )}
          <label
            htmlFor={`checkbox-${nodes.id}`}
            className="flex cursor-pointer items-center gap-x-3"
          >
            <input
              type="checkbox"
              id={`checkbox-${nodes.id}`}
              checked={selectedNodes.includes(nodes.id)}
              onChange={(event) => handleNodeSelect(event, nodes.id)}
              // className="rounded border"
            />
            <span className="w-max text-gray-700">{nodes.name}</span>
          </label>
        </div>
        {nodes.children && (
          <div
            className={cn("tree-node", {
              isOpen: isExpanded,
            })}
            aria-hidden={!isExpanded}
          >
            <div>
              {nodes.children.map((child) => renderTree(child, depth + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return <div className="max-w-sm">{data.map((node) => renderTree(node))}</div>;
};

export default CategoriesTree;

/*
const renderTree = (nodes: TreeNode): React.ReactNode => (
    <div key={nodes.id} className="max-w-fit">
      <label
        htmlFor={`checkbox-${nodes.id}`}
        className="flex cursor-pointer items-center gap-x-3"
      >
        <input
          type="checkbox"
          id={`checkbox-${nodes.id}`}
          checked={selectedNodes.includes(nodes.id)}
          onChange={(event) => handleNodeSelect(event, nodes.id)}
          className="checkbox-primary checkbox checkbox-xs border-border-stroke rounded border"
        />
        <span className="w-max text-gray-700">{nodes.name}</span>
      </label>
      {nodes.children && nodes.children.length > 0 && (
        <div className="pl-4">
          {nodes.children.map((child) => renderTree(child))}
        </div>
      )}
    </div>
  );

*/

/*
const renderTree = (nodes: TreeNode, depth = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(nodes.id);
    const contentRef = useRef<HTMLDivElement>(null);

    return (
      <div key={nodes.id} className="tree-item" style={{ paddingLeft: depth * 20 }}>
        <div className="flex items-center gap-x-3">
          {nodes.children && (
            <button
              className={`transition-transform transform ${
                isExpanded ? "rotate-90" : ""
              }`}
              onClick={() => handleNodeToggle(nodes.id)}
            >
              {isExpanded ? "▼" : "▶"}
            </button>
          )}
          <input
            type="checkbox"
            checked={selectedNodes.includes(nodes.id)}
            onChange={(event) => handleNodeSelect(event, nodes.id)}
            className="checkbox-primary checkbox checkbox-xs rounded border border-border-stroke"
          />
          <span className="w-max text-gray-700">{nodes.name}</span>
        </div>
        <div
          ref={contentRef}
          style={{
            maxHeight: isExpanded ? `${contentRef.current?.scrollHeight}px` : "0px",
            transition: "max-height 0.3s ease-in-out",
            overflow: "hidden",
          }}
        >
          {nodes.children && nodes.children.map((child) => renderTree(child, depth + 1))}
        </div>
      </div>
    );
  };

  return <div className="tree-view">{data.map((node) => renderTree(node))}</div>;
};


*/
