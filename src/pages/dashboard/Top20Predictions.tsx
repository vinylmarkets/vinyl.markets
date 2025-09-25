import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Top20Predictions as Top20PredictionsComponent } from "@/components/predictions/Top20Predictions";

export default function Top20Predictions() {
  return (
    <DashboardLayout>
      <Top20PredictionsComponent />
    </DashboardLayout>
  );
}