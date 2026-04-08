import styles from "./Legend.module.css";

const LEGEND_ITEMS = [
  { label: "Today", colorClass: "today" },
  { label: "Start / End", colorClass: "rangeEdge" },
  { label: "In Range", colorClass: "inRange" },
  { label: "Holiday", colorClass: "holiday" },
  { label: "Has Note", colorClass: "hasNote" },
];

export default function Legend() {
  return (
    <div
      className={styles.legend}
      role="complementary"
      aria-label="Calendar legend"
    >
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className={styles.item}>
          <span className={`${styles.dot} ${styles[item.colorClass]}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
