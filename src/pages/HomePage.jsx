import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllCountries } from "../services/api/countries.api";
import { queryKeys } from "../services/query/queryKeys";
import { buildHomePageData } from "../features/home/home.utils";
import { HeroSection } from "../features/home/sections/HeroSection";
import { LaunchSection } from "../features/home/sections/LaunchSection";
import { MissionSection } from "../features/home/sections/MissionSection";
import { ModesSection } from "../features/home/sections/ModesSection";
import { SignalsSection } from "../features/home/sections/SignalsSection";
import { TrendingSection } from "../features/home/sections/TrendingSection";
import { RegionsSection } from "../features/home/sections/RegionsSection";
import { Skeleton } from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/ErrorState";

export function HomePage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.countries,
    queryFn: getAllCountries,
  });

  const homeData = useMemo(() => buildHomePageData(data ?? []), [data]);

  return (
    <>
      <HeroSection metrics={homeData.metrics} />
      {isLoading ? (
        <div className="page-shell grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      ) : null}
      {isError ? (
        <div className="page-shell pb-20">
          <ErrorState description={error.message} />
        </div>
      ) : null}
      {!isLoading && !isError ? (
        <>
          <MissionSection />
          <SignalsSection metrics={homeData.metrics} />
          <TrendingSection destinations={homeData.featured} />
          <ModesSection />
          <RegionsSection regions={homeData.regions} />
          <LaunchSection metrics={homeData.metrics} />
        </>
      ) : null}
    </>
  );
}
