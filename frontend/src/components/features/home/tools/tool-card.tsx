import styles from "./ToolCard.module.css";
import { useState } from "react";
import { ToolModal } from "./tool-modal";

export type ToolCardProps = {
  title: string;
  image: string;
  description: string;
  linkedRepoRequired?: boolean;
};

export function ToolCard({
  title,
  image,
  description,
  linkedRepoRequired,
}: ToolCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={styles.card}
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" ? setOpen(true) : undefined)}
        aria-label={`Open modal for ${title}`}
      >
        <img src={image} alt={title} className={styles.image} />
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
      <ToolModal
        open={open}
        onOpenChange={setOpen}
        title={title}
        image={image}
        description={description}
        linkedRepoRequired={linkedRepoRequired}
      />
    </>
  );
}
