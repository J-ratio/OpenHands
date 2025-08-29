import { useQuery } from "@tanstack/react-query";
import { AttachedFileService } from "#/api/attached-file-service.api";

export const useGetAttachedFilesChunks = (fileIds: string[]) => {
  return useQuery({
    queryKey: ["get-attached-files-chunks", fileIds],
    queryFn: () => AttachedFileService.getChunksFromFiles(fileIds),
    enabled: fileIds.length > 0,
  });
};
