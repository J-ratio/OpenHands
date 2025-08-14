import { useState } from "react";

export const useSimulationMode = () => {
  const [isSimulationMode, setIsSimulationMode] = useState(true);

  const enableSimulation = () => setIsSimulationMode(true);
  const disableSimulation = () => setIsSimulationMode(false);

  return { isSimulationMode, enableSimulation, disableSimulation };
};
