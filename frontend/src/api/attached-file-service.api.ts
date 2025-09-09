import { routes } from "#/constants/apiRoutes";
import { openHands } from "./open-hands-axios";

export interface Chunk {
  text: string;
  full_text: string;
  file_name: string;
  data_source_id: number;
  version_name: string;
}

export interface ChunksResponse {
  data_source_id: number;
  query: string;
  chunks: Chunk[];
  total_chunks: number;
}

interface AttachedFileServiceQueryParams {
  query: string;
  limit?: number;
}

export class AttachedFileService {
  static async getChunksFromFiles(
    fileId: string,
    query: string,
    limit?: number,
  ): Promise<ChunksResponse> {
    const params: AttachedFileServiceQueryParams = {
      query,
    };

    if (limit) {
      params.limit = limit;
    }

    const { data } = await openHands.get<ChunksResponse>(
      routes.getDataSourceChunks(fileId),
      {
        params,
      },
    );

    return data;
  }
}
