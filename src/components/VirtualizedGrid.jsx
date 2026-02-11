import React from "react";
function VirtualizedGrid({
  items,
  rowHeight,
  minItemWidth = 300,
  renderItem,
}) {
  const containerRef = React.useRef(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [columns, setColumns] = React.useState(1);
  const [containerHeight, setContainerHeight] = React.useState(0);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;

      const calculatedColumns = Math.max(
        1,
        Math.floor(width / minItemWidth)
      );

      setColumns(calculatedColumns);
      setContainerHeight(height);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [minItemWidth]);

  const rowCount = Math.ceil(items.length / columns);
  const totalHeight = rowCount * rowHeight;

  const startRow = Math.floor(scrollTop / rowHeight);
  const visibleRowCount =
    containerHeight > 0
      ? Math.ceil(containerHeight / rowHeight) + 2
      : 0;

  const endRow = Math.min(rowCount, startRow + visibleRowCount);

  const visibleRows = [];

  for (let row = startRow; row < endRow; row++) {
    const rowItems = [];

    for (let col = 0; col < columns; col++) {
      const index = row * columns + col;
      if (index >= items.length) break;
      rowItems.push(items[index]);
    }

    visibleRows.push({ row, rowItems });
  }

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      requestAnimationFrame(() => {
        setScrollTop(el.scrollTop);
      });
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        height: "100%",
        overflowY: "auto",
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleRows.map(({ row, rowItems }) => (
          <div
            key={row}
            style={{
              position: "absolute",
              top: row * rowHeight,
              left: 0,
              right: 0,
              height: rowHeight,
              display: "grid",
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: 16,
              padding: "0 8px",
              boxSizing: "border-box",
            }}
          >
            {rowItems.map((item, i) => (
              <div key={i}>{renderItem(item)}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}


export default  VirtualizedGrid;