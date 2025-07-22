import React from "react";
import { SettingsDropdownInput } from "../../settings/settings-dropdown-input";

export interface RepositoryDropdownProps {
  items: { key: React.Key; label: string }[];
  onSelectionChange: (key: React.Key | null) => void;
  onInputChange: (value: string) => void;
  defaultFilter?: (textValue: string, inputValue: string) => boolean;
  isDisabled?: boolean;
  selectedKey?: string;
}

export function RepositoryDropdown({
  items,
  onSelectionChange,
  onInputChange,
  defaultFilter,
  isDisabled,
  selectedKey,
}: RepositoryDropdownProps) {
  return (
    <SettingsDropdownInput
      testId="repo-dropdown"
      name="repo-dropdown"
      placeholder="Select a repo"
      items={items}
      wrapperClassName="max-w-[500px]"
      onSelectionChange={onSelectionChange}
      onInputChange={onInputChange}
      defaultFilter={defaultFilter}
      isDisabled={isDisabled}
      selectedKey={selectedKey}
    />
  );
}
