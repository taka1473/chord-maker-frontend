import type { Preview, Decorator } from "@storybook/react";
import React from "react";
import { AuthContext } from "../src/features/auth/contexts/AuthContext";

const withMockAuth: Decorator = (Story) => (
  <AuthContext.Provider value={{ user: null, loading: false }}>
    <Story />
  </AuthContext.Provider>
);

const preview: Preview = {
  decorators: [withMockAuth],
};

export default preview;
