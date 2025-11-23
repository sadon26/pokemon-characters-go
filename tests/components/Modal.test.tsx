import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Modal from "../../app/components/Modal";
import { CloseIcon } from "../../app/assets";
import { vi } from "vitest";

describe("Modal component", () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders children inside the modal", () => {
    render(
      <Modal onClose={onCloseMock}>
        <div>Modal Content</div>
      </Modal>
    );

    const content = screen.getByText("Modal Content");
    expect(content).toBeInTheDocument();
  });

  it("renders close icon", () => {
    render(
      <Modal onClose={onCloseMock}>
        <div>Modal Content</div>
      </Modal>
    );

    const closeImg = screen.getByAltText("close-icon") as HTMLImageElement;
    expect(closeImg).toBeInTheDocument();
    expect(closeImg.src).toContain(CloseIcon);
  });

  it("calls onClose when overlay is clicked", () => {
    render(
      <Modal onClose={onCloseMock}>
        <div>Modal Content</div>
      </Modal>
    );

    const overlay =
      screen.getByText("Modal Content").parentElement!.parentElement!;
    fireEvent.click(overlay);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when modal content is clicked", () => {
    render(
      <Modal onClose={onCloseMock}>
        <div>Modal Content</div>
      </Modal>
    );

    const content = screen.getByText("Modal Content");
    fireEvent.click(content);

    expect(onCloseMock).not.toHaveBeenCalled();
  });

  it("calls onClose when close icon is clicked", () => {
    render(
      <Modal onClose={onCloseMock}>
        <div>Modal Content</div>
      </Modal>
    );

    const closeIconDiv = screen.getByAltText("close-icon").parentElement!;
    fireEvent.click(closeIconDiv);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("sets body overflow to hidden on mount and resets on unmount", () => {
    expect(document.body.style.overflow).toBe("auto");

    const { unmount } = render(
      <Modal onClose={onCloseMock}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("auto");
  });
});
