import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import ThemeSwitcher from "./ThemeSwitcher";
import { ThemeProvider, useTheme } from "../../themes/ThemeContext";
import { Theme } from "../../themes/types";

// Mock the useTheme hook
vi.mock("../../themes/ThemeContext", async () => {
  const actual: {
    ThemeProvider: React.FC<React.PropsWithChildren<{}>>;
    useTheme: () => {
      theme: Theme;
      setTheme: (theme: Theme) => void;
      availableThemes: Theme[];
    };
  } = await vi.importActual("../../themes/ThemeContext");

  return {
    ...actual,
    useTheme: vi.fn(),
  };
});

// Mock the styled-components
vi.mock("./styles", () => ({
  ThemeSwitcherContainer: (props: React.PropsWithChildren) => (
    <div data-testid="theme-switcher-container" {...props} />
  ),
  ThemeButton: ({
    children,
    $isActive,
    ...props
  }: React.PropsWithChildren<{ $isActive: boolean }>) => (
    <button
      data-testid={`theme-button-${children}`}
      data-active={$isActive}
      {...props}
    >
      {children}
    </button>
  ),
}));

describe("ThemeSwitcher Component", () => {
  const mockSetTheme = vi.fn();
  const mockThemes = [
    { name: "Default", colors: {} },
    { name: "Dark", colors: {} },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({
      theme: mockThemes[0],
      setTheme: mockSetTheme,
      availableThemes: mockThemes,
    });
  });

  it("renders correctly with available themes", () => {
    // Arrange
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>
    );

    // Assert
    expect(screen.getByTestId("theme-switcher-container")).toBeInTheDocument();
    expect(screen.getByText("Choose Theme")).toBeInTheDocument();
    expect(screen.getByTestId("theme-button-Default")).toBeInTheDocument();
    expect(screen.getByTestId("theme-button-Dark")).toBeInTheDocument();
  });

  it("highlights the active theme", () => {
    // Arrange
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>
    );

    // Assert
    expect(screen.getByTestId("theme-button-Default")).toHaveAttribute(
      "data-active",
      "true"
    );
    expect(screen.getByTestId("theme-button-Dark")).toHaveAttribute(
      "data-active",
      "false"
    );
  });

  it("calls setTheme when a theme button is clicked", () => {
    // Arrange
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>
    );

    // Act
    fireEvent.click(screen.getByTestId("theme-button-Dark"));

    // Assert
    expect(mockSetTheme).toHaveBeenCalledWith(mockThemes[1]);
  });

  it("updates the active theme when context changes", () => {
    // Arrange
    const { rerender } = render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>
    );

    // Act
    (useTheme as jest.Mock).mockReturnValue({
      theme: mockThemes[1],
      setTheme: mockSetTheme,
      availableThemes: mockThemes,
    });
    rerender(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>
    );

    // Assert
    expect(screen.getByTestId("theme-button-Default")).toHaveAttribute(
      "data-active",
      "false"
    );
    expect(screen.getByTestId("theme-button-Dark")).toHaveAttribute(
      "data-active",
      "true"
    );
  });
});
