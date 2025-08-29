import { ToolCard } from "./tool-card";
import styles from "./ToolsSection.module.css";
import { useGetHomepageTools } from "#/hooks/query/use-get-homepage-tools";

export function ToolsSection() {
  const { data, error } = useGetHomepageTools();

  if (error) return <div>{error.message}</div>;

  if (!data) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Tools</h2>
      {data.categories.map((category) => (
        <div key={category} className={styles.categoryRow}>
          <h3 className={styles.categoryTitle}>{category}</h3>
          <div className={styles.cardsRow}>
            {data.tools
              .filter((tool) => tool.category === category)
              .map((tool) => (
                <ToolCard
                  key={tool.id}
                  id={tool.id}
                  title={tool.name}
                  image={tool.image}
                  description={tool.description}
                  linkedRepoRequired={tool.linked_repo_required ?? false}
                />
              ))}
          </div>
        </div>
      ))}
    </section>
  );
}
