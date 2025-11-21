import type { FC, PropsWithChildren } from "react";

type Props = {
  children: PropsWithChildren["children"];
  className?: string;
  id?: string;
  title?: string;
  onClick?: () => void;
};

const Button: FC<Props> = ({ children, className, ...rest }) => {
  return (
    <button
      id="exportCsvBtn"
      className={`px-3 py-2 h-10 text-slate-900 rounded-lg font-medium shadow-sm hover:brightness-95 cursor-pointer
        ${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
