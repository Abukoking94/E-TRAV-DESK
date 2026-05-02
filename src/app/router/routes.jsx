import { Suspense, lazy } from "react";
import { RootLayout } from "../layout/RootLayout";

const HomePage = lazy(() =>
  import("../../pages/HomePage").then((module) => ({ default: module.HomePage })),
);
const ExplorePage = lazy(() =>
  import("../../pages/ExplorePage").then((module) => ({
    default: module.ExplorePage,
  })),
);
const DestinationPage = lazy(() =>
  import("../../pages/DestinationPage").then((module) => ({
    default: module.DestinationPage,
  })),
);
const ComparePage = lazy(() =>
  import("../../pages/ComparePage").then((module) => ({
    default: module.ComparePage,
  })),
);
const PlannerPage = lazy(() =>
  import("../../pages/PlannerPage").then((module) => ({
    default: module.PlannerPage,
  })),
);
const RegionPage = lazy(() =>
  import("../../pages/RegionPage").then((module) => ({ default: module.RegionPage })),
);
const SavedPage = lazy(() =>
  import("../../pages/SavedPage").then((module) => ({ default: module.SavedPage })),
);
const JournalPage = lazy(() =>
  import("../../pages/JournalPage").then((module) => ({
    default: module.JournalPage,
  })),
);
const AboutPage = lazy(() =>
  import("../../pages/AboutPage").then((module) => ({ default: module.AboutPage })),
);
const NotFoundPage = lazy(() =>
  import("../../pages/NotFoundPage").then((module) => ({
    default: module.NotFoundPage,
  })),
);

function RouteFallback() {
  return (
    <section className="section-space">
      <div className="page-shell">
        <div className="h-32 animate-pulse rounded-[32px] border border-white/10 bg-white/5" />
      </div>
    </section>
  );
}

function withSuspense(element) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

export const routes = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      { path: "explore", element: withSuspense(<ExplorePage />) },
      {
        path: "destination/:countryCode",
        element: withSuspense(<DestinationPage />),
      },
      { path: "compare", element: withSuspense(<ComparePage />) },
      { path: "planner", element: withSuspense(<PlannerPage />) },
      { path: "regions/:region", element: withSuspense(<RegionPage />) },
      { path: "saved", element: withSuspense(<SavedPage />) },
      { path: "journal", element: withSuspense(<JournalPage />) },
      { path: "about", element: withSuspense(<AboutPage />) },
      { path: "*", element: withSuspense(<NotFoundPage />) },
    ],
  },
];
