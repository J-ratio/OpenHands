import { useQuery } from "@tanstack/react-query";
import { HomepageService } from "#/api/homepage/homepage-service.api";

export const useGetHomepageTools = () => {
  return useQuery({
    queryKey: ["homepage-tools"],
    queryFn: HomepageService.getHomepageTools,
  });
};
