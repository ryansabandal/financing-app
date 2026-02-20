import { Balance } from "./components/Balance";
import { Allocations } from "./components/Allocations";
import { Income } from "./components/Income";
import { Transactions } from "./components/Transactions";
import { BalanceTrend } from "./components/BalanceTrend";

function App() {
  return (
    <div className="app">
      <header>
        <h1>Financing App</h1>
      </header>
      <main>
        <div className="section-grid">
          <Balance />
          <Allocations />
        </div>
        <div className="section-grid">
          <Income />
          <Transactions />
        </div>
        <BalanceTrend />
      </main>
    </div>
  );
}

export default App;
