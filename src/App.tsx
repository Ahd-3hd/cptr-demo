import { Configuration } from "./Components/Configuration";
import { Phone } from "./Components/Phone";

const App = () => {
  return (
    <div className="flex flex-col justify-between p-8 h-screen items-center lg:flex-row">
      <Configuration />
      <Phone />
    </div>
  );
};

export default App;
