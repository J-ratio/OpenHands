import { OpenHandsSourceType } from "#/types/core/base";

export interface FakeMessage {
  type: OpenHandsSourceType;
  message: string;
  delay?: number;
}
