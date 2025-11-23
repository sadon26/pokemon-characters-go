import { useEffect, type FC, type PropsWithChildren } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "~/assets";

type Props = {
  children: PropsWithChildren["children"];
  onClose?: () => void;
};

const Modal: FC<Props> = ({ children, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return createPortal(
    <div
      className="fixed top-0 left-0 w-full h-screen inset-0 flex items-center justify-center bg-white/0 backdrop-blur-md z-50"
      onClick={onClose}
    >
      <div
        className="bg-white border border-gray-400/40 rounded-2xl p-8 max-w-2xl mx-4 shadow-3xl text-left backdrop-blur-lg w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <div
          className="absolute right-6 top-4 cursor-pointer"
          onClick={onClose}
        >
          <div className="w-8 h-8">
            <img src={CloseIcon} alt="close-icon" className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
