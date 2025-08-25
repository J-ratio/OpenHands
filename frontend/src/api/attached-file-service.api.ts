import { openHands } from "./open-hands-axios";

export interface Chunk {
  text: string;
  file_name: string;
}

export interface ChunksResponse {
  chunks: Chunk[];
}

export class AttachedFileService {
  static async getChunksFromFiles(fileIds: string[]): Promise<ChunksResponse> {
    const { data } = await openHands.get<ChunksResponse>(
      "https://mocki.io/v1/4277924c-8af4-4d8b-8283-883ea7b15d5e",
      {
        params: {
          file_ids: fileIds,
        },
      },
    );

    return data;
  }
}
