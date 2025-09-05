import React, { createContext, useContext, useState } from "react";

interface SimulationContextType {
  isSimulationMode: boolean;
  enableSimulation: () => void;
  disableSimulation: () => void;
  toolId: string | undefined;
  setToolId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const SimulationContext = createContext<SimulationContextType | undefined>(
  undefined,
);

interface SimulationProviderProps {
  children: React.ReactNode;
}

export const SimulationProvider: React.FC<SimulationProviderProps> = ({
  children,
}) => {
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [toolId, setToolId] = useState<string>();

  const enableSimulation = () => {
    setIsSimulationMode(true);
  };

  const disableSimulation = () => {
    setIsSimulationMode(false);
  };

  return (
    <SimulationContext.Provider
      value={{
        isSimulationMode,
        enableSimulation,
        disableSimulation,
        toolId,
        setToolId,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulationMode = (): SimulationContextType => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error(
      "useSimulationMode must be used within a SimulationProvider",
    );
  }
  return context;
};
