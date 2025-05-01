import { BrowserRouter, Routes, Route } from "react-router-dom";
import CompanyList from "./components/CompanyList";
import FileImport from "./FileImport";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 py-6 px-6">
        <Routes>
          <Route path="/" element={<CompanyList />} />
          <Route path="/import" element={<FileImport />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
