import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "./Header";

// Mock the styled-components
vi.mock("./styles", () => ({
  HeaderContainer: (props: React.PropsWithChildren) => (
    <header data-testid="header-container" {...props} />
  ),
  LogoContainer: (props: React.PropsWithChildren) => (
    <div data-testid="logo-container" {...props} />
  ),
  StyledLogoIcon: (props: React.PropsWithChildren) => (
    <div data-testid="logo-icon" {...props} />
  ),
  StyledTitle: (props: React.PropsWithChildren) => (
    <h1 data-testid="title" {...props} />
  ),
  IconContainer: (props: React.PropsWithChildren) => (
    <div data-testid="icon-container" {...props} />
  ),
  IconButton: (props: React.PropsWithChildren) => (
    <button data-testid="icon-button" {...props} />
  ),
}));

describe("Header Component", () => {
  const mockFilterClick = vi.fn();
  const mockMenuClick = vi.fn();

  beforeEach(() => {
    render(
      <Header onFilterClick={mockFilterClick} onMenuClick={mockMenuClick} />
    );
  });

  test("renders the header container", () => {
    expect(screen.getByTestId("header-container")).toBeInTheDocument();
  });

  test("renders the logo container", () => {
    expect(screen.getByTestId("logo-container")).toBeInTheDocument();
  });

  test("renders the logo icon", () => {
    expect(screen.getByTestId("logo-icon")).toBeInTheDocument();
  });

  test("renders the correct title", () => {
    const titleElement = screen.getByTestId("title");
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent("Comic Want List");
  });

  test("renders the icon container", () => {
    expect(screen.getByTestId("icon-container")).toBeInTheDocument();
  });

  test("renders two icon buttons", () => {
    const buttons = screen.getAllByTestId("icon-button");
    expect(buttons).toHaveLength(2);
  });

  test("calls onFilterClick when filter button is clicked", () => {
    const buttons = screen.getAllByTestId("icon-button");
    fireEvent.click(buttons[0]);
    expect(mockFilterClick).toHaveBeenCalledTimes(1);
  });

  test("calls onMenuClick when menu button is clicked", () => {
    const buttons = screen.getAllByTestId("icon-button");
    fireEvent.click(buttons[1]);
    expect(mockMenuClick).toHaveBeenCalledTimes(1);
  });
});
