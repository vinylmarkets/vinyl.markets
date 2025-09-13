import { useParams } from "react-router-dom";
import PanPoteshman2006 from "./PanPoteshman2006";
import CremersWeinbaum2010 from "./CremersWeinbaum2010";
import NotFound from "../../NotFound";

const OptionsPaperRouter = () => {
  const { slug } = useParams();

  if (slug === "pan-poteshman-2006") return <PanPoteshman2006 />;
  if (slug === "cremers-weinbaum-2010") return <CremersWeinbaum2010 />;

  return <NotFound />;
};

export default OptionsPaperRouter;
