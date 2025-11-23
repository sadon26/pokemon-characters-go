import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../../app/components/Button";
import { describe, it, expect, vi } from "vitest";

describe("Button component", () => {
  it("renders children text", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Button className="bg-red-500">Press</Button>);
    const btn = screen.getByText("Press");

    expect(btn.className).toContain("bg-red-500");
  });

  it("calls onClick when clicked", () => {
    const handler = vi.fn();
    render(<Button onClick={handler}>Tap</Button>);

    fireEvent.click(screen.getByText("Tap"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const handler = vi.fn();
    render(
      <Button disabled onClick={handler}>
        Disabled
      </Button>
    );

    fireEvent.click(screen.getByText("Disabled"));
    expect(handler).not.toHaveBeenCalled();
  });

  it("applies disabled styling classes", () => {
    render(<Button disabled>Disabled Btn</Button>);
    const btn = screen.getByText("Disabled Btn");

    expect(btn.className).toContain("opacity-50");
    expect(btn.className).toContain("!cursor-not-allowed");
  });

  it("contains the default Tailwind classes", () => {
    render(<Button>Test</Button>);
    const btn = screen.getByText("Test");

    const defaultClasses = [
      "px-3",
      "py-2",
      "h-10",
      "text-slate-900",
      "rounded-lg",
      "font-medium",
      "shadow-sm",
      "hover:brightness-95",
      "cursor-pointer",
    ];

    defaultClasses.forEach((cls) => {
      expect(btn.className).toContain(cls);
    });
  });

  it("passes extra props like id and title", () => {
    render(
      <Button id="my-btn" title="hello title">
        Props Test
      </Button>
    );

    const btn = screen.getByText("Props Test");

    expect(btn.id).toBe("my-btn");
    expect(btn.title).toBe("hello title");
  });
});
