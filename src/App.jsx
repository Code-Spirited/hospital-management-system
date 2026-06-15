import { Toaster } from "sonner";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <>
      <AppRoutes />

      <Toaster
        position="top-right"
        richColors
        expand={true}
        duration={4000}
        toastOptions={{
          style: {
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            borderRadius: "12px",
          },
        }}
      />
    </>
  );
}

export default App;
