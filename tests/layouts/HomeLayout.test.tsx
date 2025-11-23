import { render, screen } from "@testing-library/react";
import HomeLayout from "../../app/layouts/HomeLayout";
import { vi } from "vitest";

vi.mock("../../app/components", () => ({
  Header: vi.fn(() => <div>Header</div>),
  PageLoader: vi.fn(() => <div>Loading...</div>),
  ErrorPage: vi.fn(() => <div>Error Page</div>),
}));

describe("HomeLayout component", () => {
  it("renders Header and children by default", () => {
    render(
      <HomeLayout>
        <div>Content</div>
      </HomeLayout>
    );

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders PageLoader when loading is true", () => {
    render(
      <HomeLayout loading>
        <div>Content</div>
      </HomeLayout>
    );

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("renders ErrorPage when error is true", () => {
    render(
      <HomeLayout error>
        <div>Content</div>
      </HomeLayout>
    );

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Error Page")).toBeInTheDocument();
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("renders children when not loading and no error", () => {
    render(
      <HomeLayout>
        <div>Content</div>
      </HomeLayout>
    );

    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    expect(screen.queryByText("Error Page")).not.toBeInTheDocument();
  });
});
