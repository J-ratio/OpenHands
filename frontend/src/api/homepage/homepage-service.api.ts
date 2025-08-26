import { openHands } from "../open-hands-axios";

export interface HomepageToolsResponse {
  status: "success" | "error";
  categories: string[];
  message: string | null;
  tools: Tool[];
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  linked_repo_required: boolean;
}

export class HomepageService {
  static async getHomepageTools(): Promise<HomepageToolsResponse> {
    const { data } = await openHands.get<HomepageToolsResponse>(
      "/api/homepage-tools",
    );
    return data;
  }
}
