export function VirtualList({
  items,
  itemHeight,
  containerHeight,
  renderItem,
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const ref = useRef();
  const totalHeight = items.length * itemHeight;
  const startIdx = Math.floor(scrollTop / itemHeight);
  const endIdx = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + 5,
  );

  const visibleItems = items.slice(startIdx, endIdx);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);
  
  return (
    <div
      ref={ref}
      style={{
        height: containerHeight,
        overflowY: "auto",
        position: "relative",
      }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems.map((item, i) => (
          <div
            key={startIdx + i}
            style={{
              position: "absolute",
              top: (startIdx + i) * itemHeight,
              height: itemHeight,
              width: "100%",
            }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}