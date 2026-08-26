import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={10}
      containerStyle={{
        top: "max(14px, env(safe-area-inset-top))",
      }}
    />
  );
}
