import type { FC, PropsWithChildren } from "react";
import { ErrorPage, Header, PageLoader } from "~/components";

type Props = {
  children: PropsWithChildren["children"];
  loading?: boolean;
  error?: boolean;
};

const HomeLayout: FC<Props> = ({
  children,
  error = false,
  loading = false,
}) => {
  return (
    <div className="max-w-[800px] mx-auto px-6">
      <Header />
      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorPage />
      ) : (
        <div className="fade-into">{children}</div>
      )}
    </div>
  );
};

export default HomeLayout;
