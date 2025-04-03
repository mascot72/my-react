import React from 'react'
import AppRouter from './routes/Routes'
import './App.css'

const App: React.FC = () => {
  return (
    <>
      <AppRouter />
    </>
  )
}

export default App

// import { StrictMode } from "react";
// import { hydrateRoot } from "react-dom/client";
// import { RouterProvider } from "react-router/dom";
// import routes from "./routes/index.ts";
// import { createBrowserRouter } from "react-router";

// const router = createBrowserRouter(routes, {
//   hydrationData: window.__staticRouterHydrationData,
// });

// hydrateRoot(
//   document,
//   <StrictMode>
//     <RouterProvider router={router} />
//   </StrictMode>
// );
