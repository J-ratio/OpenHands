import { TOOL_CATEGORIES } from "./tools-data";
import { ToolCard } from "./tool-card";
import styles from "./ToolsSection.module.css";

export function ToolsSection() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Tools</h2>
      {TOOL_CATEGORIES.map((cat) => (
        <div key={cat.category} className={styles.categoryRow}>
          <h3 className={styles.categoryTitle}>{cat.category}</h3>
          <div className={styles.cardsRow}>
            {cat.tools.map((tool) => (
              <ToolCard
                key={tool.title}
                title={tool.title}
                image={tool.image}
                description={tool.description}
                linkedRepoRequired={tool.linkedRepoRequired ?? false}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
