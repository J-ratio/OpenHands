import { t } from "i18next";

export interface DataSource {
  name: string | undefined;
  type: "GIT_REPOSITORY" | "FILE";
  id: number;
  created_by: number;
  versions: [];
  workspace_ids: Array<number>;
  created_at: string;
  updated_at: string;
}

export function ConnectedRepoInfo({ repo }: { repo: DataSource }) {
  return (
    <div className="w-full flex flex-col gap-6">
      <h2 className="heading">{t("Repository Connected")}</h2>
      <p>
        This workspace is connected to the repo:
        <a
          href={`https://github.com/${repo.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline underline-offset-2 hover:text-blue-300 transition-colors ml-1"
        >
          {repo.name}
        </a>
      </p>
    </div>
  );
}
