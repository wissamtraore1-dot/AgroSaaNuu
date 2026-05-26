import { Link } from "react-router-dom";
import {
  Search, Truck, Newspaper, TrendingUp,
  HelpCircle, User, Leaf
} from "lucide-react";
import logo from "../../assets/images/logo.jpeg";

export default function Navbar() {
  return (
    <header
      style={{ backgroundColor: "#d6d1c4" }}
      className="border-bottom"
    >
      <div className="container py-3">

        {/* TOP BAR */}
        <div className="d-flex align-items-center justify-content-between">

          {/* LOGO + NOM */}
          <Link to="/" className="d-flex align-items-center text-decoration-none">
            <img
              src={logo}
              alt="logo"
              style={{
                width: "45px",
                height: "45px",
                objectFit: "cover",
                borderRadius: "8px"
              }}
            />
            <h4 className="ms-2 mb-0 fw-bold">
              Agro<span style={{ color: "#28a745" }}>SannNuu</span>
            </h4>
          </Link>

          {/* SEARCH */}
          <div className="flex-grow-1 mx-4" style={{ maxWidth: "600px" }}>
            <div className="input-group shadow-sm">
              <span className="input-group-text bg-white border-0 rounded-start">
                <Search size={18} />
              </span>
              <input
                type="text"
                className="form-control border-0"
                placeholder="Rechercher vos produits, semences et plus encore..."
              />
              <button className="btn btn-light border rounded-end">
                Rechercher
              </button>
            </div>
          </div>

          {/* LOGIN */}
          <Link
            to="/auth/login"
            className="btn d-flex align-items-center gap-2"
            style={{
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "8px 15px",
              fontWeight: "500"
            }}
          >
            <User size={18} />
            <span className="d-none d-lg-inline">Se Connecter</span>
          </Link>
        </div>

        {/* MENU — avec les bons liens to= */}
        <div className="d-flex align-items-center justify-content-center mt-3 gap-4 flex-wrap small">

          <Link
            to="/products"
            className="d-flex align-items-center gap-1 text-dark text-decoration-none fw-medium"
          >
            <Leaf size={16} />
            Céréales
          </Link>

          <Link
            to="/transporters"
            className="d-flex align-items-center gap-1 text-dark text-decoration-none fw-medium"
          >
            <Truck size={16} />
            Transports & logistiques
          </Link>

          <Link
            to="/news"
            className="d-flex align-items-center gap-1 text-dark text-decoration-none fw-medium"
          >
            <Newspaper size={16} />
            Actualités
          </Link>

          <Link
            to="/market-prices"
            className="d-flex align-items-center gap-1 text-dark text-decoration-none fw-medium"
          >
            <TrendingUp size={16} />
            Prix du marché
          </Link>

          <Link
            to="/help"
            className="d-flex align-items-center gap-1 text-dark text-decoration-none fw-medium"
          >
            <HelpCircle size={16} />
            Aide
          </Link>

        </div>

      </div>
    </header>
  );
}