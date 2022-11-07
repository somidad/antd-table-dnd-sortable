import "./App.css";
import { Table } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";

function App() {
  const columns = [
    {
      key: "dragHandle",
      dataIndex: "dragHandle",
      title: "Drag",
      width: 30,
      render: () => <MenuOutlined />,
    },
    {
      key: "key",
      dataIndex: "key",
      title: "Key",
    },
  ];

  const dataSourceRaw = new Array(5).fill({}).map((item, index) => ({
    // This will be transformed into `data-row-key` of props.
    // Shall be truthy to be draggable. I don't know why.
    // To this end, index of number type is converted into string.
    key: index.toString(),
  }));
  const [dataSource, setDataSource] = useState(dataSourceRaw);
  // ID to render overlay.
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: any) {
    const { active } = event;
    setActiveId(active.id);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over.id) {
      setDataSource((items) => {
        // In this example, find an item, where `item.key` === `useSortable.id`.
        const oldIndex = items.findIndex((item) => item.key === active.id);
        const newIndex = items.findIndex((item) => item.key === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    // Stop overlay.
    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Table
        columns={columns}
        dataSource={dataSource}
        components={{
          body: {
            wrapper: DraggableWrapper,
            row: DraggableRow,
          },
        }}
      />
      {/* Render overlay component. */}
      <DragOverlay>
        <Table
          columns={columns}
          showHeader={false}
          dataSource={
            activeId
              ? new Array(1).fill(
                  dataSource[
                    dataSource.findIndex((item) => item.key === activeId)
                  ]
                )
              : []
          }
          pagination={false}
        />
      </DragOverlay>
    </DndContext>
  );

  function DraggableWrapper(props: any) {
    const { children, ...restProps } = props;
    /**
     * 'children[1]` is `dataSource`
     * Check if `children[1]` is an array
     * because antd gives 'No Data' element when `dataSource` is an empty array
     */
    return (
      <SortableContext
        items={
          children[1] instanceof Array
            ? children[1].map((child: any) => child.key)
            : []
        }
        strategy={verticalListSortingStrategy}
        {...restProps}
      >
        <tbody {...restProps}>
          {
            // This invokes `Table.components.body.row` for each element of `children`.
            children
          }
        </tbody>
      </SortableContext>
    );
  }

  function DraggableRow(props: any) {
    const { attributes, listeners, setNodeRef, isDragging, overIndex, index } =
      useSortable({
        id: props["data-row-key"],
      });
    const isOver = overIndex === index;
    const { children, ...restProps } = props;
    const isData = children instanceof Array;
    const style = {
      ...restProps?.style,
      ...(isData && isDragging ? { background: "#80808038" } : {}),
      ...(isData && isOver ? { borderTop: "5px solid #ec161638" } : {}),
    };
    /**
     * 'children[1]` is a row of `dataSource`
     * Check if `children[1]` is an array
     * because antd gives 'No Data' element when `dataSource` is an empty array
     */
    return (
      <tr ref={setNodeRef} {...attributes} {...restProps} style={style}>
        {children instanceof Array
          ? children.map((child: any) => {
              const { children, key, ...restProps } = child;
              return key === "dragHandle" ? (
                <td {...listeners} {...restProps}>
                  {child}
                </td>
              ) : (
                <td {...restProps}>{child}</td>
              );
            })
          : children}
      </tr>
    );
  }
}

export default App;
