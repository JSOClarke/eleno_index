import React, { useMemo, useState } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { useFilterState } from "@/hooks/useFilterState";
import { RedesignInspectorView } from "./components/RedesignInspectorView";
import { RedesignShell } from "./components/RedesignShell";
import { MOCK_CATALOGUE_ITEMS } from "./mocks/catalogueMocks";
import { RedesignCataloguePage } from "./pages/RedesignCataloguePage";

const InspectorRouteWrapper: React.FC = () => {
  const { mediaId } = useParams<{ mediaId: string }>();
  const item = MOCK_CATALOGUE_ITEMS.find((x) => x.id === mediaId) || MOCK_CATALOGUE_ITEMS[0];
  return <RedesignInspectorView item={item} />;
};

const PlaceholderView: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="rounded-2xl border border-slate-200/90 bg-white p-10 text-center shadow-xs">
    <h2 className="font-serif text-2xl font-medium text-slate-900">{title}</h2>
    <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
  </div>
);

export const RedesignPreviewRouter: React.FC = () => {
  const [activeLang, setActiveLang] = useState<"es" | "fr" | "zh">("es");
  const filterState = useFilterState();

  const langItems = useMemo(
    () => MOCK_CATALOGUE_ITEMS.filter((it) => it.language === activeLang),
    [activeLang]
  );

  return (
    <RedesignShell
      activeLang={activeLang}
      onChangeLang={setActiveLang}
      savedCount={filterState.savedIds.size}
    >
      <Routes>
        <Route index element={<RedesignCataloguePage mode="catalogue" items={langItems} filterState={filterState} />} />
        <Route path="saved" element={<RedesignCataloguePage mode="saved" items={langItems} filterState={filterState} />} />
        <Route path="media/:mediaId" element={<InspectorRouteWrapper />} />
        <Route path="words" element={<PlaceholderView title="My Words Ledger (UI Preview)" subtitle="Ready to design next — known & learning vocabulary with definitions, rankings, and packs." />} />
        <Route path="*" element={<Navigate to="/preview" replace />} />
      </Routes>
    </RedesignShell>
  );
};
