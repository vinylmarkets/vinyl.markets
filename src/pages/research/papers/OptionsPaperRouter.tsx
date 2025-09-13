import { useParams } from "react-router-dom";
import PanPoteshman2006 from "./PanPoteshman2006";
import CremersWeinbaum2010 from "./CremersWeinbaum2010";
import GarmanKohlhagen1983 from "./GarmanKohlhagen1983";
import NotFound from "../../NotFound";

const OptionsPaperRouter = () => {
  const { slug } = useParams();

  if (slug === "pan-poteshman-2006") return <PanPoteshman2006 />;
  if (slug === "cremers-weinbaum-2010") return <CremersWeinbaum2010 />;
  if (slug === "garman-kohlhagen-1983") return <GarmanKohlhagen1983 />;

  return <NotFound />;
};

export default OptionsPaperRouter;
